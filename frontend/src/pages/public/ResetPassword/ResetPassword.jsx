import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginImage from "../../../assets/LoginImage.png";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import { Link } from "react-router-dom";
import authServices from "../../../services/authService.js";
import "./ResetPassword.scss";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const onFinish = async (values) => {
        if (!token) {
            messageApi.error("Invalid or missing reset token.");
            return;
        }

        setLoading(true);
        try {
            await authServices.resetPassword(token, values.newPassword);
            messageApi.success("Password reset successfully! Redirecting to login...", 2, () => {
                navigate('/login');
            });
        } catch (error) {
            messageApi.error(error.message || "Failed to reset password. The token may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        {
            title: <Link to={"/login"}>Login</Link>
        },
        {
            title: 'Reset Password'
        }
    ];

    if (!token) {
        return (
            <>
                {contextHolder}
                <BreadscrumbMenu items={breadcrumbItems} />
                <div className="reset-password" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Invalid Reset Link</h2>
                    <p>This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password">Request a new reset link</Link>
                </div>
            </>
        );
    }

    return (
        <>
            {contextHolder}
            <BreadscrumbMenu items={breadcrumbItems} />

            <div className="reset-password">
                <Row gutter={24} align="middle">
                    <Col span={12}>
                        <div className="reset-password__image">
                            <img src={LoginImage} alt="Reset Password Image" />
                        </div>
                    </Col>
                    <Col span={12}>
                        <Form
                            layout="vertical"
                            name="reset_password_form"
                            className="reset-password__form"
                            onFinish={onFinish}
                        >
                            <h2 className="reset-password__title">Reset Password</h2>
                            <p className="reset-password__subtitle">ENTER YOUR NEW PASSWORD</p>

                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Please input your new password!' },
                                    { min: 6, message: 'Password must be at least 6 characters!' }
                                ]}
                            >
                                <Input.Password placeholder="Enter new password" size="large" />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your password!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirm new password" size="large" />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: '16px', marginTop: '42px' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    className="btn-submit"
                                    loading={loading}
                                    block
                                >
                                    RESET PASSWORD
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default ResetPassword;
