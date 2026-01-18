import React from 'react'
import { Button, Col, Form, Input, Row, message } from "antd";
import { MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import "./ChangePassword.scss"
import { useSelector } from "react-redux";
import { useState } from "react";
import authServices from "../../../services/authService.js";

const ChangePassword = () => {
    const user = useSelector((state) => state.authReducer.user);
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);

    const handleSendResetLink = async () => {
        if (!user || !user.email) {
            messageApi.error("User email not found. Please log in again.");
            return;
        }

        setLoading(true);
        try {
            await authServices.forgotPassword(user.email);
            messageApi.success("Reset link sent! Please check your email.");
        } catch (error) {
            messageApi.error(error.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <div className="change-password">
                <h2 className="change-password__title">Change Password</h2>

                <div className="change-password__card">
                    <SafetyCertificateOutlined className="change-password__icon" />

                    <h2 className="change-password__card-title">Security Verification Required</h2>

                    <p className="change-password__text">
                        For your account’s protection, we need to verify your identity before allowing a password
                        change.
                    </p>

                    <p className="change-password__text change-password__text--mb-large">
                        Please click the button below. We will send a <strong>secure link</strong> to your registered
                        email address ({user?.email}) to help you reset your password.
                    </p>

                    <Button
                        type="primary"
                        size="large"
                        icon={<MailOutlined />}
                        className="change-password__btn"
                        onClick={handleSendResetLink}
                        loading={loading}
                    >
                        SEND RESET LINK
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ChangePassword;