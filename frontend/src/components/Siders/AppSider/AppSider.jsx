import {Layout, Menu} from 'antd';
import "./AppSider.css"

const { Sider, Content } = Layout;

const AppSider = ({collapsed, onCollapse, menuItems, location = {}}) => {
    return (
        <Sider className="admin-sider"
               theme="light"
               width={230}
               collapsed={collapsed}
               onCollapse={onCollapse}
               collapsible
               collapsedWidth="70"
               style={{
                   background: "#fff",
                   borderRight: "1px solid #f0f0f0",
                   height: "calc(100vh - 64px)",
                   zIndex: 997,
                   overflow: 'auto',
                   position: 'fixed',
                   top: 64,
                   left: 0,
                   bottom: 0,
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