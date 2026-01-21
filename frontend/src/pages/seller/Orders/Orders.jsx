import React, { useState, useEffect, useCallback } from "react";
import orderService from "../../../services/orderService";
import {
    Button,
    Input,
    message,
    Modal,
    Table,
    Typography,
    Tag,
    Space,
    Tabs,
    Badge,
    Select,
    Avatar,
    Descriptions,
    Divider,
    List,
    Image,
    Row,
    Col
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    InboxOutlined,
    UserOutlined,
    EnvironmentOutlined,
    CreditCardOutlined,
    ShoppingOutlined,
    PhoneOutlined,
    RocketOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./Orders.css";

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = () => {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAllOrders({
                page: 1,
                limit: 2000,
                search: searchText
            });

            if (response?.data) {
                const orders = response.data.orders || response.data || [];
                setData(orders);

                let pending = 0, shipped = 0, delivered = 0, cancelled = 0;
                orders.forEach(o => {
                    const st = o.status ? o.status.toUpperCase() : 'UNKNOWN';
                    if (st === 'PENDING') pending++;
                    else if (st === 'SHIPPED') shipped++;
                    else if (st === 'DELIVERED') delivered++;
                    else if (st === 'CANCELLED') cancelled++;
                });
                setStats({ total: orders.length, pending, shipped, delivered, cancelled });
            }
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let res = [...data];

        if (activeTab !== 'ALL') {
            res = res.filter(o => o.status?.toUpperCase() === activeTab);
        }

        setFilteredData(res);
        setPagination(prev => ({
            ...prev,
            total: res.length,
            current: 1
        }));
    }, [data, activeTab]);

    useEffect(() => {
        fetchOrders();
    }, [searchText, messageApi]);

    const handleStatusChange = async (id, newStatus) => {
        Modal.confirm({
            title: `Change status to ${newStatus}?`,
            content: `Are you sure you want to update this order to ${newStatus}?`,
            onOk: async () => {
                try {
                    await orderService.updateOrderStatus(id, newStatus);
                    messageApi.success(`Order status updated to ${newStatus}`);
                    fetchOrders();
                } catch (error) {
                    messageApi.error("Failed to update status");
                }
            }
        });
    };

    const handleView = async (record) => {
        setLoading(true)
        try {
            const response = await orderService.getOrderById(record.id);
            const detail = response.data?.order || response.data || record;
            setSelectedOrder(detail);
            setIsViewModalOpen(true);
        } catch (error) {
            setSelectedOrder(record);
            setIsViewModalOpen(true);
        }
        finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusTagColor = (status) => {
        const s = status ? status.toUpperCase() : '';
        switch (s) {
            case 'PENDING': return 'orange';
            case 'SHIPPED': return 'geekblue';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: "Order Info",
            key: "info",
            width: 200,
            render: (_, record) => (
                <div style={{display:'flex', flexDirection:'column'}}>
                    <Text strong style={{fontFamily:'monospace'}}>#{record.id?.substring(0, 13).toUpperCase()}</Text>
                    <Text type="secondary" style={{fontSize: 12}}>
                        {dayjs(record.orderDate).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </div>
            )
        },
        {
            title: "Customer",
            key: "customer",
            width: 250,
            render: (_, record) => {
                const user = record.Customer?.User;
                return (
                    <Space>
                        <Avatar icon={<UserOutlined />} src={user?.image} />
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <Text strong style={{fontSize: 13}}>{user?.username || "Unknown"}</Text>
                            <Text type="secondary" style={{fontSize: 11}}>{user?.email}</Text>
                        </div>
                    </Space>
                )
            }
        },
        {
            title: "Total & Payment",
            key: "payment",
            width: 200,
            render: (_, record) => {
                const payment = record.Payment?.[0];
                return (
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <Text strong>{formatCurrency(payment?.amount || 0)}</Text>
                        <Tag color={payment?.method === 'COD' ? 'blue' : 'purple'} style={{width:'fit-content', marginTop:4, fontSize: 10}}>
                            {payment?.method || 'N/A'}
                        </Tag>
                    </div>
                )
            }
        },
        {
            title: "Status",
            key: "status",
            width: 150,
            render: (_, record) => {
                const status = record.status?.toUpperCase();

                const isFinal = status === 'CANCELLED' || status === 'DELIVERED';

                return (
                    <Select
                        defaultValue={status}
                        style={{ width: '100%' }}
                        onChange={(val) => handleStatusChange(record.id, val)}
                        disabled={isFinal}
                        className={`status-select-${status.toLowerCase()}`}
                    >
                        <Option value="PENDING">
                            <Tag color="orange">Pending</Tag>
                        </Option>

                        <Option value="SHIPPED">
                            <Tag color="purple">Shipped</Tag>
                        </Option>

                        <Option value="DELIVERED">
                            <Tag color="green">Delivered</Tag>
                        </Option>

                        <Option value="CANCELLED">
                            <Tag color="red">Cancelled</Tag>
                        </Option>
                    </Select>
                );
            }
        },
        {
            title: "Action",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Button size="small"
                        icon={<EyeOutlined style={{color: '#008ECC'}}/>}
                        style={{borderColor: '#008ECC'}}
                        onClick={() => handleView(record)}>
                    View
                </Button>
            )
        }
    ];

    const tabItems = [
        {
            key: 'ALL',
            label: <span><InboxOutlined /> All</span>
        },
        {
            key: 'PENDING',
            label: <span><ClockCircleOutlined /> Pending</span>
        },
        {
            key: 'SHIPPED',
            label: <span><RocketOutlined /> Shipped</span>
        },
        {
            key: 'DELIVERED',
            label: <span><CheckCircleOutlined /> Delivered</span>
        },
        {
            key: 'CANCELLED',
            label: <span><CloseCircleOutlined /> Cancelled</span>
        },
    ];

    return (
        <>
            {contextHolder}
            <div className="orders-page">
                <div className="page-header">
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Order Management</Title>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon"><InboxOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Total Orders</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-icon"><ClockCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.pending}</span>
                        </div>
                    </div>

                    <div className="stat-card shipped">
                        <div className="stat-icon"><RocketOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Shipped</span>
                            <span className="stat-value">{stats.shipped}</span>
                        </div>
                    </div>

                    <div className="stat-card delivered">
                        <div className="stat-icon"><CheckCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Delivered</span>
                            <span className="stat-value">{stats.delivered}</span>
                        </div>
                    </div>

                    <div className="stat-card cancelled">
                        <div className="stat-icon"><CloseCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Cancelled</span>
                            <span className="stat-value">{stats.cancelled}</span>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

                    <div className="table-actions">
                        <Input
                            placeholder="Search order ID, customer..."
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            style={{ width: 350 }}
                            size="large"
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            onChange: (p, s) => setPagination(prev => ({
                                ...prev,
                                current: p,
                                pageSize: s
                            }))
                        }}
                    />
                </div>
            </div>

            <Modal
                title={null}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
                width={800}
                centered
            >
                {selectedOrder && (
                    <div style={{paddingTop: 10}}>
                        <div className="order-modal-header">
                            <Title level={4} style={{margin:0}}>Order Details</Title>
                            <Text type="secondary">#{selectedOrder.id}</Text>
                            <div style={{marginTop: 10}}>
                                <Tag color={getStatusTagColor(selectedOrder.status)} style={{fontSize: 14, padding: '4px 10px'}}>
                                    {selectedOrder.status?.toUpperCase()}
                                </Tag>
                            </div>
                        </div>

                        <div className="order-section-title"><UserOutlined /> Customer & Delivery</div>
                        <Row gutter={[16, 16]} style={{marginBottom: 20}}>
                            <Col span={12}>
                                <Descriptions size="small" bordered column={1}>
                                    <Descriptions.Item label="Customer">
                                        <Space>
                                            {selectedOrder.Customer?.User?.username || "Guest"}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedOrder.Customer?.User?.email}</Descriptions.Item>
                                    <Descriptions.Item label="Phone">{selectedOrder.Address?.phoneNumber}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <div className="address-box">
                                    <div style={{fontWeight: 600, marginBottom: 4}}><EnvironmentOutlined /> Delivery Address:</div>
                                    <div>
                                        Address: <span style={{fontWeight: 600}}>{selectedOrder.Address?.address}</span>
                                    </div>

                                    <div>
                                        Street: <span style={{fontWeight: 600}}>{selectedOrder.Address?.street}</span>
                                    </div>

                                    <div>
                                        Ward &
                                        District: <span style={{fontWeight: 600}}>{selectedOrder.Address?.ward}, {selectedOrder.Address?.district}</span>
                                    </div>
                                    <div>
                                        Province: <span style={{fontWeight: 600}}>{selectedOrder.Address?.province}</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Divider dashed />

                        <div className="order-section-title"><CreditCardOutlined /> Order Information</div>
                        <Descriptions size="small" bordered column={2}>
                            <Descriptions.Item label="Order Date">
                                {dayjs(selectedOrder.orderDate).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                <Tag color="blue">{selectedOrder.Payment?.[0]?.method || "COD"}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Status">
                                <Badge
                                    status={selectedOrder.Payment?.[0]?.status === 'COMPLETED' ? 'success' : 'warning'}
                                    text={selectedOrder.Payment?.[0]?.status || "PENDING"}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Amount">
                                <Text strong style={{fontSize: 16, color: '#008ECC'}}>
                                    {formatCurrency(selectedOrder.Payment?.[0]?.amount || 0)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider dashed />

                        <div className="order-section-title"><ShoppingOutlined /> Ordered Items ({selectedOrder.OrderItem?.length})</div>
                        <div style={{maxHeight: 300, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: '0 10px'}}>
                            <List
                                itemLayout="horizontal"
                                dataSource={selectedOrder.OrderItem || []}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Image
                                                    width={60}
                                                    height={60}
                                                    src={item.ProductVariant?.Product?.images?.[0] || "https://placehold.co/60"}
                                                    style={{borderRadius: 4, objectFit: 'cover'}}
                                                />
                                            }
                                            title={<span>{item.ProductVariant?.Product?.name}</span>}
                                            description={
                                                <Space orientation="vertical" size={0}>
                                                    <Space size={4}>
                                                        {Object.entries(item.ProductVariant?.variantAttributes || {}).map(([k, v]) => (
                                                            <Tag key={k} style={{fontSize: 10}}>{k}: {v}</Tag>
                                                        ))}
                                                    </Space>
                                                    <Text type="secondary" style={{fontSize: 12}}>
                                                        Qty: {item.quantity} x {formatCurrency(item.ProductVariant?.Product?.price + (item.ProductVariant?.priceAdjustment || 0))}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                        <div style={{textAlign: 'right'}}>
                                            <Text strong>
                                                {formatCurrency((item.ProductVariant?.Product?.price + (item.ProductVariant?.priceAdjustment || 0)) * item.quantity)}
                                            </Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Orders;