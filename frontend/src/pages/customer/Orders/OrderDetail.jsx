import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Descriptions,
    List,
    Image,
    Divider,
    message,
    Spin,
} from 'antd';
import {
    ArrowLeftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
} from '@ant-design/icons';
import orderService from '../../../services/orderService';
import paymentService from '../../../services/paymentService';

const { Title, Text } = Typography;

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.authReducer || { isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [retryPaymentLoading, setRetryPaymentLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            message.error('Please login to view order details');
            navigate('/login');
            return;
        }

        fetchOrderDetails();
    }, [orderId, isAuthenticated, navigate]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderById(orderId);
            const orderData = response?.data?.order || response?.order || null;
            if (orderData) {
                setOrder(orderData);
            } else {
                message.error('Order not found');
                navigate('/orders');
            }
        } catch (error) {
            message.error('Failed to load order details');
            console.error('Error fetching order details:', error);
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryPayment = async () => {
        try {
            setRetryPaymentLoading(true);
            const response = await paymentService.retryPayment(orderId);
            console.log('Retry payment response:', response);

            if (response?.data?.sessionUrl) {
                message.success('Redirecting to Stripe checkout...');
                window.location.href = response.data.sessionUrl;
            } else if (response?.sessionUrl) {
                message.success('Redirecting to Stripe checkout...');
                window.location.href = response.sessionUrl;
            } else {
                throw new Error('Failed to get checkout URL');
            }
        } catch (error) {
            message.error(error.message || 'Failed to retry payment');
            console.error('Error retrying payment:', error);
        } finally {
            setRetryPaymentLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <ClockCircleOutlined />;
            case 'SHIPPED': return <CarOutlined />;
            case 'DELIVERED': return <CheckCircleOutlined />;
            case 'CANCELLED': return <CloseCircleOutlined />;
            default: return <ClockCircleOutlined />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'SHIPPED': return 'blue';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'green';
            case 'PENDING': return 'orange';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getItemPrice = (item) => {
        if (item.price !== undefined) return item.price;
        const basePrice = item.productVariant?.product?.price || 0;
        const priceAdjustment = item.productVariant?.priceAdjustment || 0;
        return basePrice + priceAdjustment;
    };

    const calculateOrderTotal = (order) => {
        if (!order?.orderItems) return 0;
        return order.orderItems.reduce((total, item) => {
            const itemPrice = getItemPrice(item);
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/orders')}
                    style={{ marginBottom: '16px' }}
                >
                    Back to Orders
                </Button>
            </div>

            {/* Order Information */}
            <Card title="Order Information" style={{ marginBottom: '16px' }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Order ID" span={2}>
                        <Text copyable>{order.id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(order.status)} icon={getStatusIcon(order.status)}>
                            {order.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Order Date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </Descriptions.Item>
                    {order.payment && (
                        <>
                            <Descriptions.Item label="Payment Method">
                                <Tag color={order.payment.method === 'COD' ? 'gold' : 'blue'}>
                                    {order.payment.method}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Status">
                                <Tag color={order.payment.status === 'SUCCESS' ? 'green' : order.payment.status === 'PENDING' ? 'orange' : 'red'}>
                                    {order.payment.status}
                                </Tag>
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>

            {/* Delivery Address */}
            {order.address && (
                <Card title="Delivery Address" style={{ marginBottom: '16px' }}>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Recipient">
                            {order.address.recipientName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {order.address.phoneNumber || order.address.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address">
                            {order.address.address ||
                                `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Order Items */}
            <Card title="Order Items">
                <List
                    itemLayout="horizontal"
                    dataSource={order.orderItems || []}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Image
                                        width={80}
                                        src={
                                            item.productVariant?.images?.[0] ||
                                            item.productVariant?.product?.images?.[0] ||
                                            'https://via.placeholder.com/80'
                                        }
                                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                }
                                title={
                                    <Text strong>
                                        {item.productVariant?.product?.name || 'Product'}
                                    </Text>
                                }
                                description={
                                    <Space direction="vertical" size="small">
                                        {item.productVariant?.variantAttributes && (
                                            <Text type="secondary">
                                                {Object.entries(item.productVariant.variantAttributes)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(', ')}
                                            </Text>
                                        )}
                                        <Text>Quantity: {item.quantity}</Text>
                                    </Space>
                                }
                            />
                            <div style={{ textAlign: 'right' }}>
                                <Text strong style={{ fontSize: '16px' }}>
                                    ${(getItemPrice(item) * item.quantity).toFixed(2)}
                                </Text>
                                <br />
                                <Text type="secondary">
                                    ${getItemPrice(item).toFixed(2)} each
                                </Text>
                            </div>
                        </List.Item>
                    )}
                />

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space direction="vertical" align="end">
                        <div>
                            <Text>Subtotal: </Text>
                            <Text strong>${calculateOrderTotal(order).toFixed(2)}</Text>
                        </div>
                        <div style={{
                            padding: '12px 24px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            minWidth: '300px'
                        }}>
                            <Text strong style={{ fontSize: '20px' }}>Total Amount: </Text>
                            <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
                                ${order.payment?.amount?.toFixed(2) || calculateOrderTotal(order).toFixed(2)}
                            </Text>
                        </div>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default OrderDetail;
