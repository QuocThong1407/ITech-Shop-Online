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

const { Title, Text } = Typography;

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.authReducer || { isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            message.error('Please login to view order details');
            navigate('/login');
            return;
        }

        fetchOrderDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, isAuthenticated, navigate]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderById(orderId);
            console.log('Order detail response:', response);
            const orderData = response?.data || null;
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

    const getItemPrice = (item) => {
        if (item.price !== undefined) return item.price;
        // Handle PascalCase from Supabase
        const productVariant = item.ProductVariant || item.productVariant;
        const product = productVariant?.Product || productVariant?.product;
        const basePrice = product?.price || 0;
        const priceAdjustment = productVariant?.priceAdjustment || 0;
        return basePrice + priceAdjustment;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const calculateOrderTotal = (order) => {
        // Use payment amount if available
        if (order?.Payment?.[0]?.amount !== undefined) return order.Payment[0].amount;
        const orderItems = order?.OrderItem || order?.orderItems || [];
        if (orderItems.length === 0) return 0;
        return orderItems.reduce((total, item) => {
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
                    {order.Payment && (
                        <>
                            <Descriptions.Item label="Payment Method">
                                <Tag color={order.Payment[0].method === 'COD' ? 'gold' : 'blue'}>
                                    {order.Payment[0].method}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Status">
                                <Tag color={order.Payment[0].status === 'SUCCESS' ? 'green' : order.Payment[0].status === 'PENDING' ? 'orange' : 'red'}>
                                    {order.Payment[0].status}
                                </Tag>
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>

            {/* Delivery Address */}
            {order.Address && (
                <Card title="Delivery Address" style={{ marginBottom: '16px' }}>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Recipient">
                            {order.Address.recipientName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {order.Address.phoneNumber || order.Address.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address">
                            {order.Address.address ||
                                `${order.Address.street}, ${order.Address.ward}, ${order.Address.district}, ${order.Address.province}`}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Order Items */}
            <Card title="Order Items">
                <List
                    itemLayout="horizontal"
                    dataSource={order.OrderItem || []}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Image
                                        width={80}
                                        src={
                                            item.ProductVariant?.images?.[0] ||
                                            item.ProductVariant?.Product?.images?.[0] ||
                                            'https://via.placeholder.com/80'
                                        }
                                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                }
                                title={
                                    <Text strong>
                                        {item.ProductVariant?.Product?.name || 'Product'}
                                    </Text>
                                }
                                description={
                                    <Space direction="vertical" size="small">
                                        {item.ProductVariant?.variantAttributes && (
                                            <Text type="secondary">
                                                {Object.entries(item.ProductVariant.variantAttributes)
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
                                    {formatCurrency(getItemPrice(item) * item.quantity)}
                                </Text>
                                <br />
                                <Text type="secondary">
                                    {formatCurrency(getItemPrice(item))} each
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
                            <Text strong>{formatCurrency(calculateOrderTotal(order))}</Text>
                        </div>
                        <div style={{
                            padding: '12px 24px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            minWidth: '300px'
                        }}>
                            <Text strong style={{ fontSize: '20px' }}>Total Amount: </Text>
                            <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
                                {formatCurrency(order.Payment?.[0]?.amount || calculateOrderTotal(order))}
                            </Text>
                        </div>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default OrderDetail;
