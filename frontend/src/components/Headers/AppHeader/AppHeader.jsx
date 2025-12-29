import { LogoutOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import {Col, Dropdown, Row, Space} from "antd";
import {Link} from "react-router-dom";
import "./AppHeader.css"

const AppHeader = ({title, homePath, username = "User", onLogout}) => {
    const adminMenu = {
        items: [
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: onLogout,
            }
        ]
    }


    return (
        <header className="admin-header">
            <Row className="admin-header__main">
                <Col span={8}>
                    <Link to={homePath} className="logo">
                        {title}
                    </Link>
                </Col>
                <Col span={16}>
                    <div className="main__right">
                        <Dropdown menu={adminMenu} placement="bottomRight" arrow>
                            <Space className="user-menu-trigger">
                                <UserOutlined className="icon"/>
                                <span className="admin-name">{username}</span>
                                <DownOutlined className="down-icon"/>
                            </Space>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
        </header>
    )
}

export default AppHeader;