import {Col, Form, Input, message, Row, Spin} from "antd";
import {Link, useNavigate} from "react-router-dom";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import RegisterImage from "../../../assets/LoginImage.png"
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton.jsx";
import "./Register.css"
import {useState} from "react";
import authServices from "../../../services/authService.js";

const Register = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await authServices.register({
                username: values.username,
                email: values.email,
                password: values.password
            })

            if (response.success) {
                messageApi.open({
                    type: 'success',
                    content: 'Register Successfully!',
                    duration: 0.5,
                    onClose: () => {
                        navigate('/login');
                    }
                });
            }
        }
        catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message || 'Register failed. Email or Password already exists!',
            });
        }
        finally {
            setLoading(false);
        }
    }

    const breadcrumbItems = [{ title: 'Register' }];

    return (
        <div className="register-page-wrapper">
            {contextHolder}

            <div className="container">
                <BreadscrumbMenu items={breadcrumbItems}/>
            </div>

            <div className="register-container">
                <div className="register-card">
                    <Spin spinning={loading}>
                        <Row gutter={0} style={{width: '100%'}}>
                            <Col xs={0} md={12} className="register-image-col">
                                <img src={RegisterImage} alt="Register Illustration" className="register-image"/>
                            </Col>

                            <Col xs={24} md={12} className="register-form-col">
                                <div className="form-content">
                                    <h2 className="welcome-title">REGISTER NOW!</h2>
                                    <p className="welcome-subtitle">JOIN TO US</p>
                                </div>

                                <Form className="register-form"
                                      name="register_form"
                                      layout="vertical"
                                      onFinish={onFinish}>

                                    <Form.Item
                                        label="Your Name"
                                        name="username"
                                        rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}>
                                        <Input placeholder="New User" className="custom-input" />
                                    </Form.Item>

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

                                    <Form.Item name="password_confirmation"
                                               label="Confirm Password"
                                               dependencies={['password']}
                                               rules={[
                                                   {required: true, message: 'Please input your confirm password'},
                                                   ({getFieldValue}) => ({
                                                       validator(_, value) {
                                                           if (!value || getFieldValue('password') === value) {
                                                               return Promise.resolve();
                                                           }
                                                           return Promise.reject(new Error('Passwords do not match!'));
                                                       },
                                                   }),
                                               ]}>
                                        <Input.Password placeholder="••••••••" className="custom-input"/>
                                    </Form.Item>

                                    <Form.Item>
                                        <PrimaryButton htmlType="submit" block loading={false} style={{marginTop: 12}}>
                                            SIGN UP
                                        </PrimaryButton>
                                    </Form.Item>

                                    <div className="login-redirect">
                                        <span>ALREADY USER? </span>
                                        <Link to="/login" className="highlight-link">SIGN IN NOW!</Link>
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

export default Register;