import './Header.css'
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined, TruckOutlined, DropboxOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { Input, Flex, Button, Divider, Grid, Row, Col, message, Menu, Avatar, Dropdown, AutoComplete, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import authService from "../../services/authService.js";
import { setLogout } from "../../redux/actions/authAction.js";
import productService from "../../services/productService.js";
import { useEffect, useState, useRef } from "react";
import categoryService from "../../services/categoryService.js";
import { setCategories } from "../../redux/actions/categoryAction.js";
const { Search } = Input;
const { Text } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState([]);
    const searchContainerRef = useRef(null);

    const { isAuthenticated, user } = useSelector((state) => state.authReducer);

    const categories = useSelector((state) => state.categories.allCategories);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getAllCategories();
                dispatch(setCategories(categories.data))
            }
            catch (error) {
                console.error(error)
            }
        }
        fetchCategories()
    }, []);

    // Search suggestions with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchValue.trim()) {
                try {
                    const response = await productService.getAllProducts({ search: searchValue, limit: 5 });

                    if (response?.data?.products) {
                        const searchOptions = response.data.products.map(product => ({
                            value: product.name,
                            key: product.id,
                            label: (
                                <div className="search-suggestion-item">
                                    <Avatar
                                        shape="square"
                                        size={48}
                                        src={product.images?.[0]}
                                        style={{ marginRight: 10, flexShrink: 0 }}
                                    />
                                    <div className="search-suggestion-info">
                                        <Text strong ellipsis className="product-name">{product.name}</Text>
                                        <Text type="danger" className="product-price">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </Text>
                                    </div>
                                </div>
                            ),
                        }));
                        setOptions(searchOptions);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setOptions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);

    const onSelect = (value, option) => {
        navigate(`/products/${option.key}`);
        setSearchValue('');
    };

    const onSearchSubmit = (value) => {
        if (value && value.trim()) {
            navigate(`/search?key=${encodeURIComponent(value.trim())}`);
            setSearchValue('');
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(setLogout());
            messageApi.open({
                type: 'success',
                content: 'Log out successfully!',
            });
        }
        catch (error) {
            console.error(error);
            messageApi.open({
                type: 'error',
                content: 'Log out failed',
            });
        }
    }

    const userMenu = {
        items: [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: <Link to="/profile">Profile</Link>
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout
            }
        ]
    };

    const categoryMenu = {
        items: categories.map(category => ({
            key: category.id,
            label: <Link to={`/category/${category.id}`}>{category.name}</Link>,
        }))
    }

    return (
        <div className='header'>
            {contextHolder}
            {/* <div className="header__upper">
                <div className="upper__left">
                    <span>Welcome to my everything-shop!</span>
                </div>
                <div className='upper__right'>
                    <span>
                        <DownOutlined className='icon' />
                        Deliver 000000
                    </span>
                    <span>
                        <TruckOutlined className='icon' />
                        Track your order
                    </span>
                    <span>
                        <DropboxOutlined className='icon' />
                        All offers
                    </span>
                </div>
            </div> */}
            <Row className="header__middle">
                <Col span={6}>
                    <Link to="/" className="logo">
                        ITech Shop
                    </Link>
                </Col>
                <Col span={12}>
                    <div style={{position: 'relative', width: '100%'}} ref={searchContainerRef}>
                        <AutoComplete
                            popupMatchSelectWidth={true}
                            style={{width: '100%'}}
                            options={options}
                            onSelect={onSelect}
                            onSearch={(text) => setSearchValue(text)}
                            value={searchValue}
                            defaultActiveFirstOption={false}
                        >
                            <Input.Search
                                placeholder="Search essentials, groceries and more..."
                                enterButton
                                size="large"
                                onSearch={onSearchSubmit}
                            />
                        </AutoComplete>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="middle__right">
                        {isAuthenticated ? (
                            <>
                                <Link to="/cart" className="header-action-item">
                                    <ShoppingCartOutlined className="icon" />
                                    <span>Cart</span>
                                </Link>

                                <Link to="/orders" className="header-action-item">
                                    <DropboxOutlined className="icon" />
                                    <span>Orders</span>
                                </Link>

                                <Divider type="vertical" style={{ height: "20px", borderLeft: "1px solid #d9d9d9", margin: "0", alignSelf: "center" }} />

                                <Dropdown menu={userMenu} placement="bottomLeft" arrow>
                                    <a onClick={(e) => e.preventDefault()} className="user-menu-trigger">
                                        <UserOutlined className="icon" />
                                        {user?.username || 'User'}
                                    </a>
                                </Dropdown>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="header-action-item">
                                    <UserOutlined className="icon" />
                                    <span>Sign Up/Sign In</span>
                                </Link>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
            <Row className="header__lower">
                <Dropdown menu={categoryMenu} trigger={['hover']} placement={"bottomLeft"} arrow>
                    <Button icon={<MenuOutlined />} style={{ border: "none", padding: "0", boxShadow: "none" }}>
                        All Categories
                    </Button>
                </Dropdown>
            </Row>
        </div>
    );
}

export default Header;