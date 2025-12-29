import {Link, Outlet} from "react-router-dom";
import AdminHeader from "../../Headers/AppHeader/AppHeader.jsx";
import {Layout} from "antd";
import AdminSider from "../../Siders/AppSider/AppSider.jsx";
import {useState} from "react";
import {BarChartOutlined, GiftOutlined, ProductOutlined, UserOutlined} from "@ant-design/icons";

const { Content} = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const handleCollapse = (isCollapsed) => {
        setCollapsed(isCollapsed);
    };

    const menuItems = [
        {
            key: "/admin/customers",
            icon: <UserOutlined />,
            label: <Link to="/admin/customers">Customers</Link>,
        },
        {
            key: "/admin/staffs",
            icon: <UserOutlined />,
            label: <Link to="/admin/staffs">Staffs</Link>,
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
            key: "/admin/reports",
            icon: <BarChartOutlined />,
            label: <Link to="/admin/reports">Reports</Link>,
        },
    ]

    return (
        <>
            <Layout style={{ minHeight: "100vh" }}>
                <AdminHeader title="ADMIN PORTAL"
                           homePath="/admin"
                           username="Adminstrator"
                           onLogout={() => console.log("Admin logout")}/>
                <Layout>
                    <AdminSider onCollapse={handleCollapse} menuItems={menuItems} />
                    <Content style={{ padding: '32px' }}>
                        <Outlet/>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default AdminLayout;