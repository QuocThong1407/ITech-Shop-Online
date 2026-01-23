import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Skeleton, Modal, Popconfirm } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ExclamationCircleFilled } from '@ant-design/icons';
import addressService from '../../../services/addressService';

const AddressEdit = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchAddress();
        }
    }, [id]);

    const fetchAddress = async () => {
        setInitialLoading(true);
        try {
            const res = await addressService.getAddress(id);
            if (res && res.data) {
                form.setFieldsValue(res.data);
            } else {
                message.error("Address not found");
                navigate('/profile/my-address');
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch address details");
        } finally {
            setInitialLoading(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (isEditMode) {
                await addressService.updateAddress(id, values);
                message.success("Address updated successfully");
            } else {
                await addressService.createAddress(values);
                message.success("Address created successfully");
            }
            navigate('/profile/my-address');
        } catch (error) {
            console.error(error);
            message.error("Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await addressService.deleteAddress(id);
            message.success('Address deleted successfully');
            navigate('/profile/my-address');
        } catch (error) {
            console.error('Error deleting address:', error);
            message.error('Failed to delete address');
        }
    };

    if (initialLoading) {
        return <Skeleton active />;
    }

    return (
        <div className="address-edit-page">
            <h2 style={{ fontSize: "32px", color: '#008ECC', marginBottom: '24px' }}>
                {isEditMode ? 'Edit Address' : 'New Address'}
            </h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                name="address_edit_form"
            >
                <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[{ required: true, message: 'Please input phone number!' }]}
                >
                    <Input size="large" placeholder="Phone Number" />
                </Form.Item>

                <Form.Item
                    label="Address (House number, Apartment)"
                    name="address"
                    rules={[{ required: true, message: 'Please input address details!' }]}
                >
                    <Input size="large" placeholder="House number, Apartment name..." />
                </Form.Item>

                <Form.Item
                    label="Street"
                    name="street"
                    rules={[{ required: true, message: 'Please input street!' }]}
                >
                    <Input size="large" placeholder="Street name" />
                </Form.Item>

                <Form.Item
                    label="Ward"
                    name="ward"
                    rules={[{ required: true, message: 'Please input ward!' }]}
                >
                    <Input size="large" placeholder="Ward" />
                </Form.Item>

                <Form.Item
                    label="District"
                    name="district"
                    rules={[{ required: true, message: 'Please input district!' }]}
                >
                    <Input size="large" placeholder="District" />
                </Form.Item>

                <Form.Item
                    label="Province"
                    name="province"
                    rules={[{ required: true, message: 'Please input province!' }]}
                >
                    <Input size="large" placeholder="Province" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        style={{ backgroundColor: "#008ECC", minWidth: '120px' }}
                    >
                        SAVE
                    </Button>

                    <Button
                        size="large"
                        onClick={() => navigate('/profile/my-address')}
                    >
                        Cancel
                    </Button>

                    {isEditMode && (
                        <Popconfirm
                            title="Delete the address"
                            description="Are you sure to delete this address?"
                            onConfirm={handleDelete}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                danger
                                size="large"
                                style={{ marginLeft: 'auto' }}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            </Form>
        </div>
    );
};

export default AddressEdit;
