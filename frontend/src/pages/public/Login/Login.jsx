import {Col, Form, Input, message, Row, Spin} from "antd";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import LoginImage from "../../../assets/LoginImage.png"
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton.jsx";
import "./Login.css"
import {useState} from "react";
import authServices from "../../../services/authService.js";
import {setLoginSuccess} from "../../../redux/actions/authAction.js";

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const navigateBasedOnRole = (role) => {
        switch (role) {
            case 'ADMIN':
                navigate('/admin');
                break;
            case 'SELLER':
                navigate('/seller');
                break;
            case 'CUSTOMER':
                navigate('/');
                break;
            default:
                navigate('/');
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const userData = await authServices.login({
                email: values.email,
                password: values.password
            });

            if (userData) {
                // Normalize: store only the user object, not the wrapper
                const user = userData.data?.user || userData.data;
                dispatch(setLoginSuccess(user));

                messageApi.open({
                    type: 'success',
                    content: 'Login Successfully!',
                    duration: 0.5,
                    onClose: () => {
                        navigateBasedOnRole(user.role);
                    }
                });
            }
        }
        catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message || 'Email or Password is incorrect.',
            });
        }
        finally {
            setLoading(false);
        }
    }

    const breadcrumbItems = [{ title: 'Login' }];

    return (
        <div className="login-page-wrapper">
            {contextHolder}

            <div className="container">
                <BreadscrumbMenu items={breadcrumbItems}/>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <Spin spinning={loading}>
                        <Row gutter={0} style={{width: '100%'}}>
                            <Col xs={0} md={12} className="login-image-col">
                                <img src={LoginImage} alt="Login Illustration" className="login-image"/>
                            </Col>

                            <Col xs={24} md={12} className="login-form-col">
                                <div className="form-content">
                                    <h2 className="welcome-title">WELCOME BACK!</h2>
                                    <p className="welcome-subtitle">LOGIN TO CONTINUE SHOPPING</p>
                                </div>

                                <Form className="login-form"
                                      name="login_form"
                                      layout="vertical"
                                      onFinish={onFinish}>

                                    <Form.Item name="email"
                                               label="Email"
                                               rules={[
                                                   {required: true, message: 'Please input your email'},
                                                   {type: 'email', message: 'Invalid email address!'}
                                               ]}>
                                        <Input placeholder={"username@example.com"} className="custom-input"/>
                                    </Form.Item>

                                    <Form.Item name="password"
                                               label="Password"
                                               rules={[
                                                   {required: true, message: 'Please input your password'},
                                                   {type: 'password', message: 'Invalid password'},
                                               ]}>
                                        <Input.Password placeholder="••••••••" className="custom-input"/>
                                    </Form.Item>

                                    <div className="form-actions">
                                        <Link to="/forgot-password" className="forgot-password-link">
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    <Form.Item>
                                        <PrimaryButton htmlType="submit" block loading={false}>
                                            SIGN IN
                                        </PrimaryButton>
                                    </Form.Item>

                                    <div className="register-redirect">
                                        <span>NEW USER? </span>
                                        <Link to="/register" className="highlight-link">SIGN UP NOW!</Link>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Spin>
                </div>
            </div>
        </div>
    )
}

export default Login;