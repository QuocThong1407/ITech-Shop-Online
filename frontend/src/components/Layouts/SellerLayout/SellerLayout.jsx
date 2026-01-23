import {Link, Outlet, useLocation} from "react-router-dom";
import SellerHeader from "../../Headers/AppHeader/AppHeader.jsx";
import {Layout} from "antd";
import SellerSider from "../../Siders/AppSider/AppSider.jsx";
import {useState} from "react";
import {ShoppingCartOutlined, AppstoreOutlined, FileSyncOutlined, ExceptionOutlined} from "@ant-design/icons";

const { Content} = Layout;

const SellerLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const handleCollapse = (isCollapsed) => {
        setCollapsed(isCollapsed);
    };

    const menuItems = [
        {
            key: "/seller/orders",
            icon: <ShoppingCartOutlined />,
            label: <Link to="/seller/orders">Orders</Link>,
        },
        {
            key: "/seller/products",
            icon: <AppstoreOutlined />,
            label: <Link to="/seller/products">Products</Link>,
        },
        {
            key: "/seller/returns",
            icon: <FileSyncOutlined />,
            label: <Link to="/seller/returns">Returns</Link>,
        },
        {
            key: "/seller/cancellations",
            icon: <ExceptionOutlined />,
            label: <Link to="/seller/cancellations">Cancellations</Link>,
        },
    ];

    return (
        <>
            <Layout style={{ minHeight: "100vh" }}>
                <SellerHeader title="SELLER PORTAL"
                             homePath="/seller"
                             username="Seller"
                             onLogout={() => console.log("Seller logout")}/>
                <Layout style={{flex: 1}}>
                    <SellerSider collapsed={collapsed} onCollapse={handleCollapse} menuItems={menuItems} location={location} />

                    <Content style={{
                        padding: '32px',
                        marginLeft: collapsed ? 70 : 230,
                        marginTop: 64,
                        transition: 'all 0.2s',
                        minHeight: '100vh',
                    }}>
                        <Outlet/>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default SellerLayout;