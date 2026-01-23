import { LogoutOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import {Col, Dropdown, message, Row, Space} from "antd";
import {Link} from "react-router-dom";
import "./AppHeader.css"
import authService from "../../../services/authService.js";
import {setLogout} from "../../../redux/actions/authAction.js";
import {useDispatch} from "react-redux";

const AppHeader = ({title, homePath, username = "User"}) => {
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

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

    const adminMenu = {
        items: [
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout,
            }
        ]
    }


    return (
        <header className="admin-header">
            {contextHolder}

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