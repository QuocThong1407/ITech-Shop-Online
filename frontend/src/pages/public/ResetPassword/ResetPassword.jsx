import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, Row, message, Spin } from "antd";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import LoginImage from "../../../assets/LoginImage.png";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import { Link } from "react-router-dom";
import authServices from "../../../services/authService.js";
import "./ResetPassword.scss";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    // State to store token and error info
    const [token, setToken] = useState(null);
    const [hashError, setHashError] = useState(null);

    // Parse token from URL hash fragment (Supabase sends token in hash) or query params
    useEffect(() => {
        const parseTokenFromUrl = () => {
            // Reset states for fresh detection
            setHashError(null);
            
            // First check query params (standard token param)
            const queryToken = searchParams.get('token');
            if (queryToken) {
                setToken(queryToken);
                sessionStorage.setItem('resetPasswordToken', queryToken);
                setInitializing(false);
                return;
            }

            // Parse hash fragment using window.location.hash directly (more reliable)
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                const hashParams = new URLSearchParams(hash.substring(1));
                
                // Check for errors in the hash
                const error = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');
                if (error) {
                    setHashError({
                        error,
                        description: errorDescription?.replace(/\+/g, ' ') || 'Unknown error'
                    });
                    sessionStorage.removeItem('resetPasswordToken');
                    setInitializing(false);
                    return;
                }

                // Check for access_token with type=recovery
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');
                if (accessToken && type === 'recovery') {
                    setToken(accessToken);
                    sessionStorage.setItem('resetPasswordToken', accessToken);
                    setInitializing(false);
                    // Clear hash from URL to prevent issues on refresh
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    return;
                }
            }

            // Check sessionStorage for previously stored token (survives navigation)
            const storedToken = sessionStorage.getItem('resetPasswordToken');
            if (storedToken) {
                setToken(storedToken);
                setInitializing(false);
                return;
            }

            // No valid token found
            setInitializing(false);
        };

        parseTokenFromUrl();
    }, [location.hash, location.key, searchParams]);

    const onFinish = async (values) => {
        if (!token) {
            messageApi.error("Invalid or missing reset token.");
            return;
        }

        setLoading(true);
        try {
            await authServices.resetPassword(token, values.newPassword);
            // Clear stored token after successful reset
            sessionStorage.removeItem('resetPasswordToken');
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

    // Show loading while parsing token
    if (initializing) {
        return (
            <>
                {contextHolder}
                <BreadscrumbMenu items={breadcrumbItems} />
                <div className="reset-password" style={{ textAlign: 'center', padding: '48px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Validating reset link...</p>
                </div>
            </>
        );
    }

    // Show error if there was an error in the hash (e.g., expired link)
    if (hashError) {
        return (
            <>
                {contextHolder}
                <BreadscrumbMenu items={breadcrumbItems} />
                <div className="reset-password" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Invalid Reset Link</h2>
                    <p style={{ color: '#ff4d4f' }}>{hashError.description}</p>
                    <p>Please request a new password reset link.</p>
                    <Link to="/forgot-password">Request a new reset link</Link>
                </div>
            </>
        );
    }

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
