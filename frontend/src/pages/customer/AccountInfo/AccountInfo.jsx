import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Skeleton } from 'antd';
import userService from '../../../services/userService';

const AccountInfo = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState({ username: false, email: false });

    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        setLoading(true);
        try {
            const res = await userService.getUserInfo();
            if (res && res.data && res.data.user) {
                const { username, email } = res.data.user;
                const data = { username, email };
                setInitialValues(data);
                form.setFieldsValue(data);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch user info");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field) => {
        setEditing(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (field) => {
        try {
            const value = form.getFieldValue(field);
            if (!value) {
                message.error(`${field} cannot be empty`);
                return;
            }

            await userService.updateUserInfo({ [field]: value });
            message.success(`${field} updated successfully`);
            setEditing(prev => ({ ...prev, [field]: false }));
            setInitialValues(prev => ({ ...prev, [field]: value }));

            // Reload page to reflect changes
            window.location.reload();
        } catch (error) {
            console.error(error);
            message.error(`Failed to update ${field}`);
        }
    };

    const renderSuffixButton = (field) => {
        if (editing[field]) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleSubmit(field)}
                >
                    Submit
                </Button>
            );
        }
        return (
            <Button
                type="link"
                size="small"
                onClick={(e) => {
                    e.preventDefault();
                    handleEdit(field);
                }}
            >
                Edit
            </Button>
        );
    };

    if (loading) {
        return <Skeleton active />;
    }

    return (
        <div className="account__info">
            <h2 style={{ fontSize: "32px", color: '#008ECC', marginBottom: '24px' }}>Account Info</h2>
            <Form
                form={form}
                layout="vertical"
                name="account_form"
                initialValues={initialValues}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input
                        size="large"
                        disabled={!editing.username}
                        suffix={renderSuffixButton('username')}
                    />
                </Form.Item>

                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                >
                    <Input
                        size="large"
                        disabled={!editing.email}
                        suffix={renderSuffixButton('email')}
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export default AccountInfo;