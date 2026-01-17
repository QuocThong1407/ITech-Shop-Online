 import React, { useState } from 'react'
 import {Button, Col, Form, Input, Row, message} from "antd";
 import LoginImage from "../../../assets/LoginImage.png"
 import "./ForgotPassword.scss"
 import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
 import {Link, useNavigate} from "react-router";
 import authServices from "../../../services/authServices.js";

 const ForgotPassword = () => {
     const [loading, setLoading] = useState(false);
     const [messageApi, contextHolder] = message.useMessage();
     const navigate = useNavigate();

     const onFinish = async (values) => {
         setLoading(true);
         try {
             await authServices.forgotPassword(values.email);
             messageApi.success("If an account exists with this email, a password reset link has been sent.", 3, () => {
                 navigate('/login');
             });
         } catch (error) {
             messageApi.error(error.message || "Failed to send reset link. Please try again.");
         } finally {
             setLoading(false);
         }
     }

    const breadcrumbItems = [
        {
            title: <Link to={"/login"}>Login</Link>
        },
        {
            title: 'Forgot Password'
        }
    ];

    return (
        <>
            {contextHolder}
            <BreadscrumbMenu items={breadcrumbItems}/>

            <div className="forgot-password">
                <Row gutter={24} align="middle">
                    <Col span={12}>
                        <div className="forgot-password__image">
                            <img src={LoginImage} alt="Forgot Password Image"/>
                        </div>
                    </Col>
                    <Col span={12}>
                        <Form
                            layout="vertical"
                            name="forgot_password_form"
                            className="forgot-password__form"
                            onFinish={onFinish}
                        >
                            <h2 className="forgot-password__title">Forgot Password</h2>
                            <p className="forgot-password__subtitle">ENTER YOUR EMAIL TO RESET PASSWORD</p>

                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[
                                    {required: true, message: 'Please input your email!'},
                                    {type: 'email', message: 'Invalid email format!'}
                                ]}
                            >
                                <Input placeholder="Example@gmail.com" size="large"/>
                            </Form.Item>

                            <Form.Item style={{marginBottom: '16px', marginTop: '42px'}}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    className="btn-submit"
                                    loading={loading}
                                >
                                    SEND RESET LINK
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default ForgotPassword;
