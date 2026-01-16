import {
    UserOutlined,
    BarChartOutlined,
    GiftOutlined,
    ProductOutlined
} from "@ant-design/icons";
import {Link, useLocation} from "react-router-dom";
import {Layout, Menu} from 'antd';
import "./AppSider.css"

const { Sider, Content } = Layout;

const AppSider = ({menuItems}) => {
    const location = useLocation();

    return (
        <Sider className="admin-sider"
               theme="light"
               width={230}
               collapsible
               style={{
                   background: "#fff",
                   borderRight: "1px solid #f0f0f0",
                   height: "calc(100vh - 64px)",
                   zIndex: 999,
                   position: "sticky",
                   top: 64,
                   left: 0
               }}>
            <Menu
                mode="inline"
                theme="light"
                selectedKeys={[location.pathname]}
                defaultChecked={menuItems[0]}
                items={menuItems}
            />
        </Sider>
    )
}

export default AppSider;