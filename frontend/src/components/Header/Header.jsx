import './Header.css'
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined, TruckOutlined, DropboxOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { Input, Flex, Button, Divider, Grid, Row, Col, message, Menu, Avatar, Dropdown } from 'antd'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import authService from "../../services/authService.js";
import { setLogout } from "../../redux/actions/authAction.js";
import { useEffect } from "react";
import categoryService from "../../services/categoryService.js";
import { setCategories } from "../../redux/actions/categoryAction.js";
const { Search } = Input;

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

    const { isAuthenticated, user } = useSelector((state) => state.authReducer);

    const categories = useSelector((state) => state.allCategories.categories);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getAllCategoriesSimple();
                dispatch(setCategories(categories.data))
            }
            catch (error) {
                console.error(error)
            }
        }
        fetchCategories()
    }, []);

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
            <div className="header__upper">
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
            </div>
            <Row className="header__middle">
                <Col span={6}>
                    <Link to="/" className="logo">
                        EVERYTHING SHOP
                    </Link>
                </Col>
                <Col span={12}>
                    <Search placeholder="Search essentials, groceries and more..." enterButton onSearch={(value) => {
                        if (value.trim()) {
                            navigate(`/search?key=${encodeURIComponent(value.trim())}`);
                        }
                    }} />
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