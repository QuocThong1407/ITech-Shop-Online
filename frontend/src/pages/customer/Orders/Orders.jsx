import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Empty,
    Spin,
    List,
    Tag,
    Button,
    Typography,
    Space,
    Image,
    Collapse,
    Divider,
    message,
    Popconfirm,
    Modal,
    Input,
} from 'antd';
import {
    ShoppingOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
    StarFilled,
    RollbackOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import orderService from '../../../services/orderService';
import cancellationService from '../../../services/cancellationService';
import returnService from '../../../services/returnService';
import paymentService from '../../../services/paymentService';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const Orders = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.authReducer || { user: {}, isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);

    // Modal State
    const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [requestReason, setRequestReason] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            message.error('Please login to view your orders');
            navigate('/login');
            return;
        }

        if (!user?.customer?.id) {
            message.error('Customer information not available');
            setLoading(false);
            return;
        }

        fetchOrders();
    }, [user, isAuthenticated, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders();
            const ordersData = response?.data?.orders || response?.orders || [];

            // Process orders to include return entries
            const items = [];
            ordersData.forEach(order => {
                items.push({ type: 'ORDER', data: order });
                if (order.return) {
                    items.push({ type: 'RETURN', data: order.return, order: order });
                }
            });

            setOrders(ordersData);
            setDisplayItems(items);
        } catch (error) {
            message.error('Failed to load orders');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await orderService.updateOrderStatus(orderId, 'CANCELLED');
            message.success('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            message.error('Failed to cancel order');
        }
    };

    const handleRetryPayment = async (orderId) => {
        try {
            const response = await paymentService.retryPayment(orderId);
            if (response?.data?.sessionUrl) {
                message.success('Redirecting to Stripe checkout...');
                window.location.href = response.data.sessionUrl;
            } else if (response?.sessionUrl) {
                window.location.href = response.sessionUrl;
            } else {
                throw new Error('Failed to get checkout URL');
            }
        } catch (error) {
            message.error(error.message || 'Failed to retry payment');
        }
    };

    const handleCancellationRequest = async () => {
        if (!requestReason.trim()) {
            message.error('Please provide a reason');
            return;
        }
        try {
            setRequestLoading(true);
            await cancellationService.createCancellationRequest(selectedOrder.id, requestReason);
            message.success('Cancellation request submitted');
            setCancellationModalVisible(false);
            setRequestReason('');
            fetchOrders();
        } catch (error) {
            message.error(error.message || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleReturnRequest = async () => {
        if (!requestReason.trim()) {
            message.error('Please provide a reason');
            return;
        }
        try {
            setRequestLoading(true);
            await returnService.createReturnRequest(selectedOrder.id, requestReason);
            message.success('Return request submitted');
            setReturnModalVisible(false);
            setRequestReason('');
            fetchOrders();
        } catch (error) {
            message.error(error.message || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleWithdrawCancellation = async (orderId) => {
        try {
            await cancellationService.withdrawCancellationRequest(orderId);
            message.success('Request withdrawn successfully');
            fetchOrders();
        } catch (error) {
            message.error(error.message || 'Failed to withdraw request');
        }
    };

    const handleWithdrawReturn = async (orderId) => {
        try {
            await returnService.withdrawReturnRequest(orderId);
            message.success('Request withdrawn successfully');
            fetchOrders();
        } catch (error) {
            message.error(error.message || 'Failed to withdraw request');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <ClockCircleOutlined />;
            case 'SHIPPED': return <CarOutlined />;
            case 'DELIVERED': return <CheckCircleOutlined />;
            case 'CANCELLED': return <CloseCircleOutlined />;
            case 'APPROVED': return <CheckCircleOutlined />;
            case 'REJECTED': return <CloseCircleOutlined />;
            case 'REQUESTED': return <ClockCircleOutlined />;
            default: return <ClockCircleOutlined />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'SHIPPED': return 'blue';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'red';
            case 'REQUESTED': return 'gold';
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
        return new Date(dateString).toLocaleDateString('en-US', {
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
        if (order?.payment?.amount !== undefined) return order.payment.amount;
        if (!order?.orderItems) return 0;
        return order.orderItems.reduce((total, item) => {
            return total + (getItemPrice(item) * item.quantity);
        }, 0);
    };

    const renderActionButtons = (order) => {
        if (order.status === 'CANCELLED') return null;

        // Validation for SHIPPED orders (Cancellation Request)
        if (order.status === 'SHIPPED') {
            if (order.cancellation) {
                if (order.cancellation.status === 'REQUESTED') {
                    return (
                        <Popconfirm
                            title="Withdraw Request"
                            description="Are you sure you want to withdraw your cancellation request?"
                            onConfirm={() => handleWithdrawCancellation(order.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="default" icon={<UndoOutlined />}>
                                Withdraw Request
                            </Button>
                        </Popconfirm>
                    );
                }
                return <Tag color={getStatusColor(order.cancellation.status)}>Cancellation: {order.cancellation.status}</Tag>;
            }
            return (
                <Button
                    danger
                    onClick={() => {
                        setSelectedOrder(order);
                        setCancellationModalVisible(true);
                    }}
                >
                    Request Cancellation
                </Button>
            );
        }

        // Validation for PENDING orders (Direct Cancel)
        if (order.status === 'PENDING') {
            return (
                <Space>
                    {/* Retry Payment for pending Stripe orders */}
                    {order.payment?.method === 'STRIPE' && order.payment?.status !== 'SUCCESS' && (
                        <Button
                            type="primary"
                            onClick={() => handleRetryPayment(order.id)}
                        >
                            Retry Payment
                        </Button>
                    )}
                    <Popconfirm
                        title="Cancel Order"
                        description="Are you sure you want to cancel this order?"
                        onConfirm={() => handleCancelOrder(order.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="default" danger>
                            Cancel Order
                        </Button>
                    </Popconfirm>
                </Space>
            );
        }

        // Validation for DELIVERED orders (Return Request)
        if (order.status === 'DELIVERED') {
            // "One order can have one Cancellation or Return"
            if (order.return) {
                // Return entry handles the tracking, so maybe just show nothing or status here?
                return null;
            }
            return (
                <Button
                    type="default"
                    onClick={() => {
                        setSelectedOrder(order);
                        setReturnModalVisible(true);
                    }}
                >
                    Request Return
                </Button>
            );
        }

        return null;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!displayItems || displayItems.length === 0) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty description="No orders yet">
                    <Button type="primary" onClick={() => navigate('/products')}>Start Shopping</Button>
                </Empty>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <List
                dataSource={displayItems}
                renderItem={(item) => {
                    // RETURN ENTRY RENDER
                    if (item.type === 'RETURN') {
                        const returnData = item.data;
                        const order = item.order;
                        return (
                            <Card
                                key={`return-${returnData.id}`}
                                style={{ marginBottom: '16px', background: '#fafafa', borderColor: '#d9d9d9' }}
                                title={
                                    <Space>
                                        <RollbackOutlined style={{ color: '#1890ff' }} />
                                        <Text strong>Return for Order #{order.id.substring(0, 8)}...</Text>
                                    </Space>
                                }
                                extra={
                                    returnData.status === 'REQUESTED' && (
                                        <Popconfirm
                                            title="Withdraw Request"
                                            description="Are you sure you want to withdraw this return request?"
                                            onConfirm={() => handleWithdrawReturn(order.id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button type="link" danger>Withdraw Request</Button>
                                        </Popconfirm>
                                    )
                                }
                            >
                                <Space size="large">
                                    <div>
                                        <Text type="secondary">Return Status:</Text>
                                        <br />
                                        <Tag icon={getStatusIcon(returnData.status)} color={getStatusColor(returnData.status)}>
                                            {returnData.status}
                                        </Tag>
                                    </div>
                                    <Divider type="vertical" />
                                    <div>
                                        <Text type="secondary">Reason:</Text>
                                        <br />
                                        <Text>{returnData.reason}</Text>
                                    </div>
                                    <Divider type="vertical" />
                                    <div>
                                        <Text type="secondary">Requested On:</Text>
                                        <br />
                                        <Text>{formatDate(returnData.createdAt)}</Text>
                                    </div>
                                </Space>
                            </Card>
                        );
                    }

                    // ORDER ENTRY RENDER
                    const order = item.data;
                    const total = calculateOrderTotal(order);

                    return (
                        <Card
                            key={order.id}
                            style={{ marginBottom: '16px' }}
                            title={
                                <Space>
                                    <Text type="secondary">Order ID:</Text>
                                    <Text strong>{order.id.substring(0, 8)}...</Text>
                                </Space>
                            }
                            extra={
                                <Space size="middle">
                                    {renderActionButtons(order)}
                                    {order.status === 'DELIVERED' && order.payment?.status === 'SUCCESS' && (
                                        <Button
                                            type="primary"
                                            icon={<StarFilled />}
                                            onClick={() => navigate(`/orders/${order.id}/review`)}
                                        >
                                            {order.orderItems.every(item => !!item.review) ? 'Edit Review' : 'Leave a Review'}
                                        </Button>
                                    )}
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        style={{ padding: 0 }}
                                    >
                                        View Details
                                    </Button>
                                </Space>
                            }
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <Space size="large" style={{ width: '100%' }}>
                                    <div>
                                        <Text type="secondary">Date:</Text>
                                        <br />
                                        <Text>{formatDate(order.createdAt)}</Text>
                                    </div>
                                    <Divider type="vertical" />
                                    <div>
                                        <Text type="secondary">Status:</Text>
                                        <br />
                                        <Tag icon={getStatusIcon(order.status)} color={getStatusColor(order.status)}>
                                            {order.status}
                                        </Tag>
                                    </div>
                                    <Divider type="vertical" />
                                    <div>
                                        <Text type="secondary">Payment:</Text>
                                        <br />
                                        {order.payment ? (
                                            <Tag color={getPaymentStatusColor(order.payment.status)}>
                                                {order.payment.method} - {order.payment.status}
                                            </Tag>
                                        ) : (
                                            <Tag color="default">No Payment Info</Tag>
                                        )}
                                    </div>
                                </Space>
                            </div>

                            <Collapse ghost>
                                <Panel header={`${order.orderItems?.length || 0} items`} key="1">
                                    <List
                                        dataSource={order.orderItems || []}
                                        renderItem={(item) => (
                                            <List.Item key={item.id}>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Image
                                                            src={
                                                                item.productVariant?.images?.[0] ||
                                                                item.productVariant?.product?.images?.[0] ||
                                                                'https://via.placeholder.com/60'
                                                            }
                                                            width={60}
                                                        />
                                                    }
                                                    title={item.productVariant?.product?.name}
                                                    description={`${item.quantity} x $${getItemPrice(item).toFixed(2)}`}
                                                />
                                                <Text strong>${(getItemPrice(item) * item.quantity).toFixed(2)}</Text>
                                            </List.Item>
                                        )}
                                    />
                                </Panel>
                            </Collapse>

                            <Divider />
                            <div style={{ textAlign: 'right' }}>
                                <Text strong>Total: ${total.toFixed(2)}</Text>
                            </div>
                        </Card>
                    );
                }}
            />

            {/* Request Modals */}
            <Modal
                title="Request Cancellation"
                open={cancellationModalVisible}
                onOk={handleCancellationRequest}
                onCancel={() => {
                    setCancellationModalVisible(false);
                    setRequestReason('');
                }}
                confirmLoading={requestLoading}
            >
                <Text>Please provide a reason for cancelling this order:</Text>
                <TextArea
                    rows={4}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    style={{ marginTop: '10px' }}
                    placeholder="Enter reason..."
                    minLength={3}
                />
            </Modal>

            <Modal
                title="Request Return"
                open={returnModalVisible}
                onOk={handleReturnRequest}
                onCancel={() => {
                    setReturnModalVisible(false);
                    setRequestReason('');
                }}
                confirmLoading={requestLoading}
            >
                <Text>Please provide a reason for returning this order:</Text>
                <TextArea
                    rows={4}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    style={{ marginTop: '10px' }}
                    maxLength={1000}
                    placeholder="Enter reason..."
                    minLength={3}
                />
            </Modal>
        </div >
    );
};

export default Orders;
