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
    Modal,
    Input,
    Tabs,
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
    StopOutlined,
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
    const { isAuthenticated } = useSelector((state) => state.authReducer || { isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [myReturns, setMyReturns] = useState([]);
    const [myCancellations, setMyCancellations] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');

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

        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, navigate]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchOrders(),
                fetchMyReturns(),
                fetchMyCancellations(),
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await orderService.getMyOrders();
            const ordersData = response?.data?.orders || response?.orders || [];
            setOrders(ordersData);
        } catch (error) {
            message.error('Failed to load orders');
            console.error('Error fetching orders:', error);
        }
    };

    const fetchMyReturns = async () => {
        try {
            const response = await returnService.getMyReturns();
            const returnsData = response?.data?.returns || response?.returns || [];
            setMyReturns(returnsData);
        } catch (err) {
            console.error('Error fetching returns:', err);
        }
    };

    const fetchMyCancellations = async () => {
        try {
            const response = await cancellationService.getMyCancellations();
            const cancellationsData = response?.data?.cancellations || response?.cancellations || [];
            setMyCancellations(cancellationsData);
        } catch (err) {
            console.error('Error fetching cancellations:', err);
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
            await fetchAllData();
            setActiveTab('cancellations'); // Switch to cancellations tab to show the new request
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
            await fetchAllData();
            setActiveTab('returns'); // Switch to returns tab to show the new request
        } catch (error) {
            message.error(error.message || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    // Helper to check if an order has a pending return request
    const getOrderReturnRequest = (orderId) => {
        return myReturns.find(r => r.Order?.id === orderId);
    };

    // Helper to check if an order has a pending cancellation request
    const getOrderCancellationRequest = (orderId) => {
        return myCancellations.find(c => c.Order?.id === orderId);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getItemPrice = (item) => {
        if (item.price !== undefined) return item.price;
        // Handle both PascalCase (from Supabase) and camelCase (normalized)
        const productVariant = item.ProductVariant || item.productVariant;
        const product = productVariant?.Product || productVariant?.product;
        const basePrice = product?.price || 0;
        const priceAdjustment = productVariant?.priceAdjustment || 0;
        return basePrice + priceAdjustment;
    };

    const calculateOrderTotal = (order) => {
        // Handle both PascalCase (from Supabase) and camelCase (normalized)
        const payment = order?.Payment?.[0] || order?.payment;
        if (payment?.amount !== undefined) return payment.amount;
        const orderItems = order?.OrderItem || order?.orderItems || [];
        if (orderItems.length === 0) return 0;
        return orderItems.reduce((total, item) => {
            return total + (getItemPrice(item) * item.quantity);
        }, 0);
    };

    // Helper to get order items (handles both PascalCase and camelCase)
    const getOrderItems = (order) => {
        return order?.OrderItem || order?.orderItems || [];
    };

    // Helper to get payment info (handles both PascalCase and camelCase)
    const getOrderPayment = (order) => {
        const payment = order?.Payment;
        if (Array.isArray(payment)) return payment[0];
        return payment || order?.payment;
    };

    const renderActionButtons = (order) => {
        if (order.status === 'CANCELLED') return null;

        const cancellationRequest = getOrderCancellationRequest(order.id);
        const returnRequest = getOrderReturnRequest(order.id);

        // Validation for SHIPPED orders (Cancellation Request)
        if (order.status === 'SHIPPED') {
            if (cancellationRequest) {
                return (
                    <Tag icon={getStatusIcon(cancellationRequest.status)} color={getStatusColor(cancellationRequest.status)}>
                        Cancellation: {cancellationRequest.status}
                    </Tag>
                );
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

        // Validation for PENDING orders (Cancellation Request)
        if (order.status === 'PENDING') {
            if (cancellationRequest) {
                return (
                    <Tag icon={getStatusIcon(cancellationRequest.status)} color={getStatusColor(cancellationRequest.status)}>
                        Cancellation: {cancellationRequest.status}
                    </Tag>
                );
            }
            return (
                <Space>
                    {/* Retry Payment for pending Stripe orders */}
                    {order.Payment?.[0]?.method === 'STRIPE' && order.Payment?.[0]?.status !== 'SUCCESS' && (
                        <Button
                            type="primary"
                            onClick={() => handleRetryPayment(order.id)}
                        >
                            Retry Payment
                        </Button>
                    )}
                    <Button
                        danger
                        onClick={() => {
                            setSelectedOrder(order);
                            setCancellationModalVisible(true);
                        }}
                    >
                        Cancel Order
                    </Button>
                </Space>
            );
        }

        // Validation for DELIVERED orders (Return Request)
        if (order.status === 'DELIVERED') {
            if (returnRequest) {
                return (
                    <Tag icon={getStatusIcon(returnRequest.status)} color={getStatusColor(returnRequest.status)}>
                        Return: {returnRequest.status}
                    </Tag>
                );
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

    if (orders.length === 0 && myReturns.length === 0 && myCancellations.length === 0) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty description="No orders yet">
                    <Button type="primary" onClick={() => navigate('/products')}>Start Shopping</Button>
                </Empty>
            </div>
        );
    }

    const renderOrderCard = (order) => {
        const total = calculateOrderTotal(order);
        const orderItems = getOrderItems(order);
        const payment = getOrderPayment(order);
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
                        {order.status === 'DELIVERED' && payment?.status === 'SUCCESS' && (
                            <Button
                                type="primary"
                                icon={<StarFilled />}
                                onClick={() => navigate(`/orders/${order.id}/review`)}
                            >
                                {orderItems.every(item => !!item.review) ? 'Edit Review' : 'Leave a Review'}
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
                            {payment ? (
                                <Tag color={getPaymentStatusColor(payment.status)}>
                                    {payment.method} - {payment.status}
                                </Tag>
                            ) : (
                                <Tag color="default">No Payment Info</Tag>
                            )}
                        </div>
                    </Space>
                </div>

                <Collapse ghost>
                    <Panel header={`${orderItems.length} items`} key="1">
                        <List
                            dataSource={orderItems}
                            renderItem={(item) => {
                                const productVariant = item.ProductVariant || item.productVariant;
                                const product = productVariant?.Product || productVariant?.product;
                                return (
                                    <List.Item key={item.id}>
                                        <List.Item.Meta
                                            avatar={
                                                <Image
                                                    src={
                                                        productVariant?.images?.[0] ||
                                                        product?.images?.[0] ||
                                                        'https://via.placeholder.com/60'
                                                    }
                                                    width={60}
                                                />
                                            }
                                            title={product?.name}
                                            description={`${item.quantity} x ${formatCurrency(getItemPrice(item))}`}
                                        />
                                        <Text strong>{formatCurrency(getItemPrice(item) * item.quantity)}</Text>
                                    </List.Item>
                                );
                            }}
                        />
                    </Panel>
                </Collapse>

                <Divider />
                <div style={{ textAlign: 'right' }}>
                    <Text strong>Total: {formatCurrency(total)}</Text>
                </div>
            </Card>
        );
    };

    const renderReturnCard = (returnData) => {
        const order = returnData.Order;
        return (
            <Card
                key={`return-${returnData.id}`}
                style={{ marginBottom: '16px', background: '#fafafa' }}
                title={
                    <Space>
                        <RollbackOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Return Request</Text>
                        {order && <Text type="secondary">for Order #{order.id.substring(0, 8)}...</Text>}
                    </Space>
                }
            >
                <Space size="large" wrap>
                    <div>
                        <Text type="secondary">Status:</Text>
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
                {order && (
                    <>
                        <Divider />
                        <Collapse ghost>
                            <Panel header={`${order.OrderItem?.length || 0} items`} key="1">
                                <List
                                    dataSource={order.OrderItem || []}
                                    renderItem={(item) => (
                                        <List.Item key={item.id}>
                                            <List.Item.Meta
                                                avatar={
                                                    <Image
                                                        src={
                                                            item.ProductVariant?.Product?.images?.[0] ||
                                                            'https://via.placeholder.com/60'
                                                        }
                                                        width={60}
                                                    />
                                                }
                                                title={item.ProductVariant?.Product?.name}
                                                description={`Qty: ${item.quantity}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        </Collapse>
                    </>
                )}
            </Card>
        );
    };

    const renderCancellationCard = (cancellationData) => {
        const order = cancellationData.Order;
        return (
            <Card
                key={`cancellation-${cancellationData.id}`}
                style={{ marginBottom: '16px', background: '#fff7e6' }}
                title={
                    <Space>
                        <StopOutlined style={{ color: '#fa8c16' }} />
                        <Text strong>Cancellation Request</Text>
                        {order && <Text type="secondary">for Order #{order.id.substring(0, 8)}...</Text>}
                    </Space>
                }
            >
                <Space size="large" wrap>
                    <div>
                        <Text type="secondary">Status:</Text>
                        <br />
                        <Tag icon={getStatusIcon(cancellationData.status)} color={getStatusColor(cancellationData.status)}>
                            {cancellationData.status}
                        </Tag>
                    </div>
                    <Divider type="vertical" />
                    <div>
                        <Text type="secondary">Reason:</Text>
                        <br />
                        <Text>{cancellationData.reason}</Text>
                    </div>
                    <Divider type="vertical" />
                    <div>
                        <Text type="secondary">Requested On:</Text>
                        <br />
                        <Text>{formatDate(cancellationData.createdAt)}</Text>
                    </div>
                </Space>
                {order && (
                    <>
                        <Divider />
                        <Collapse ghost>
                            <Panel header={`${order.OrderItem?.length || 0} items`} key="1">
                                <List
                                    dataSource={order.OrderItem || []}
                                    renderItem={(item) => (
                                        <List.Item key={item.id}>
                                            <List.Item.Meta
                                                avatar={
                                                    <Image
                                                        src={
                                                            item.ProductVariant?.Product?.images?.[0] ||
                                                            'https://via.placeholder.com/60'
                                                        }
                                                        width={60}
                                                    />
                                                }
                                                title={item.ProductVariant?.Product?.name}
                                                description={`Qty: ${item.quantity}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        </Collapse>
                    </>
                )}
            </Card>
        );
    };

    const tabItems = [
        {
            key: 'orders',
            label: `Orders (${orders.length})`,
            children: (
                <List
                    dataSource={orders}
                    renderItem={(order) => renderOrderCard(order)}
                    locale={{ emptyText: <Empty description="No orders yet" /> }}
                />
            ),
        },
        {
            key: 'returns',
            label: `Returns (${myReturns.length})`,
            children: (
                <List
                    dataSource={myReturns}
                    renderItem={(returnData) => renderReturnCard(returnData)}
                    locale={{ emptyText: <Empty description="No return requests" /> }}
                />
            ),
        },
        {
            key: 'cancellations',
            label: `Cancellations (${myCancellations.length})`,
            children: (
                <List
                    dataSource={myCancellations}
                    renderItem={(cancellationData) => renderCancellationCard(cancellationData)}
                    locale={{ emptyText: <Empty description="No cancellation requests" /> }}
                />
            ),
        },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <ShoppingOutlined /> My Orders
            </Title>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
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
                    maxLength={500}
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
                    maxLength={500}
                    placeholder="Enter reason..."
                />
            </Modal>
        </div>
    );
};

export default Orders;
