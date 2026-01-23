import {Link, Outlet, useLocation} from "react-router-dom";
import AdminHeader from "../../Headers/AppHeader/AppHeader.jsx";
import {Layout} from "antd";
import AdminSider from "../../Siders/AppSider/AppSider.jsx";
import {useState} from "react";
import {
    BarChartOutlined,
    GiftOutlined,
    ProductOutlined,
    TagsOutlined,
    UserOutlined,
    DashboardOutlined,
    AppstoreOutlined,
    DollarOutlined, SafetyCertificateOutlined, SettingOutlined
} from "@ant-design/icons";

const { Content} = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const handleCollapse = (isCollapsed) => {
        setCollapsed(isCollapsed);
    };

    const menuItems = [
        {
            key: "/admin/dashboard",
            icon: <DashboardOutlined />,
            label: <Link to="/admin/dashboard">Dashboard</Link>,
        },
        {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Users</Link>,
        },
        {
            key: "/admin/products",
            icon: <AppstoreOutlined />,
            label: <Link to="/admin/products">Products</Link>,
        },
        {
            key: "/admin/categories",
            icon: <TagsOutlined />,
            label: <Link to="/admin/categories">Categories</Link>,
        },
        {
            key: "/admin/promotions",
            icon: <ProductOutlined />,
            label: <Link to="/admin/promotions">Promotions</Link>,
        },
        {
            key: "/admin/coupons",
            icon: <GiftOutlined />,
            label: <Link to="/admin/coupons">Coupons</Link>,
        },
        {
            icon: <BarChartOutlined />,
            label: <span>Reports</span>,
            children: [
                {
                    key: '/admin/reports/revenues',
                    icon: <DollarOutlined/>,
                    label: <Link to="/admin/reports/revenues">Revenues</Link>,
                },
                {
                    key: '/admin/reports/activities',
                    icon: <SafetyCertificateOutlined/>,
                    label: <Link to="/admin/reports/activities">Activities</Link>,
                }
            ]
        },
        {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: <Link to="/admin/settings">Settings</Link>,
        }
    ]

    return (
        <>
            <Layout style={{ minHeight: "100vh" }}>
                <AdminHeader title="ADMIN PORTAL"
                           homePath="/admin"
                           username="Adminstrator"
                           onLogout={() => console.log("Admin logout")}/>
                <Layout style={{flex: 1}}>
                    <AdminSider collapsed={collapsed} onCollapse={handleCollapse} menuItems={menuItems} location={location} />

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

export default AdminLayout;