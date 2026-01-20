import React, { useState, useEffect, useCallback } from "react";
import returnService from "../../../services/returnService.js";
import {
    Button,
    Input,
    message,
    Modal,
    Table,
    Typography,
    Tag,
    Tooltip,
    Space,
    Tabs,
    Badge,
    Select,
    Avatar,
    Descriptions,
    Divider,
    List,
    Image
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    UserOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    InboxOutlined,
    CreditCardOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./Returns.css";

const { Title, Text } = Typography;
const { Option } = Select;

const Returns = () => {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [stats, setStats] = useState({
        total: 0,
        requested: 0,
        approved: 0,
        rejected: 0,
        completed: 0
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const response = await returnService.getAllReturns({
                page: 1,
                limit: 1000,
                search: searchText
            });

            if (response?.data) {
                const returns = response.data.returns || response.data || [];
                setData(returns);

                let requested = 0, approved = 0, rejected = 0, completed = 0;
                returns.forEach(r => {
                    const st = r.status ? r.status.toUpperCase() : 'UNKNOWN';
                    if (st === 'REQUESTED') requested++;
                    else if (st === 'APPROVED') approved++;
                    else if (st === 'REJECTED') rejected++;
                    else if (st === 'COMPLETED') completed++;
                });
                setStats({ total: returns.length, requested, approved, rejected, completed });
            }
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to load return requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let res = [...data];

        if (activeTab !== 'ALL') {
            res = res.filter(r => r.status?.toUpperCase() === activeTab);
        }

        setFilteredData(res);
        setPagination(prev => ({
            ...prev,
            total: res.length,
            current: 1
        }));
    }, [data, activeTab]);

    useEffect(() => {
        fetchReturns();
    }, [searchText, messageApi]);

    const handleStatusChange = async (id, newStatus) => {
        Modal.confirm({
            title: `Update Status to ${newStatus}?`,
            content: `Are you sure you want to mark this request as ${newStatus}?`,
            onOk: async () => {
                try {
                    await returnService.updateReturnStatus(id, newStatus);
                    messageApi.success(`Status updated to ${newStatus}`);
                    fetchReturns();
                } catch (error) {
                    messageApi.error("Failed to update status");
                }
            }
        });
    };

    const handleView = async (record) => {
        try {
            const response = await returnService.getReturnById(record.id);
            const detail = response.data || record;
            setSelectedReturn(detail);
            setIsViewModalOpen(true);
        } catch (error) {
            setSelectedReturn(record);
            setIsViewModalOpen(true);
        }
    };

    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s === 'REQUESTED') return <Badge status="warning" text="Requested" />;
        if (s === 'APPROVED') return <Badge status="processing" text="Approved (Processing)" />;
        if (s === 'REJECTED') return <Badge status="error" text="Rejected" />;
        if (s === 'COMPLETED') return <Badge status="success" text="Completed" />;
        return <Badge status="default" text={s} />;
    };

    const getStatusTagColor = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s === 'REQUESTED') return 'orange';
        if (s === 'APPROVED') return 'blue';
        if (s === 'REJECTED') return 'red';
        if (s === 'COMPLETED') return 'green';
        return 'default';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: "Request ID",
            key: "info",
            width: 200,
            render: (_, record) => (
                <Text strong>
                    Return #{record.id?.substring(0, 13)}
                </Text>
            )
        },
        {
            title: "Customer",
            key: "customer",
            width: 250,
            render: (_, record) => {
                const user = record.Order?.Customer?.User;
                return (
                    <Space>
                        <Avatar icon={<UserOutlined />} src={user?.image} />
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <Text strong style={{fontSize: 13}}>{user?.username || "Unknown"}</Text>
                            <Text type="secondary" style={{fontSize: 11}}>{user?.email}</Text>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: "Created At",
            key: "createAt",
            width: 200,
            render: (_, record) => (
                <Text type="secondary" style={{fontSize: 14}}>
                    Date: {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}
                </Text>
            )
        },
        {
            title: "Status",
            key: "status",
            width: 180,
            render: (_, record) => {
                const status = record.status?.toUpperCase();

                if (status === 'APPROVED' || status === 'REJECTED') {
                    return (
                        <Select
                            defaultValue={status}
                            style={{ width: '100%' }}
                            onChange={(val) => handleStatusChange(record.id, val)}
                            status="warning"
                        >
                            <Select.Option value="APPROVED">Approve</Select.Option>
                            <Select.Option value="REJECTED">Reject</Select.Option>
                            <Select.Option value="COMPLETED">Completed</Select.Option>
                        </Select>
                    );
                }

                return (
                    <Tag color={getStatusTagColor(status)} style={{width: '100%', textAlign: 'center'}}>
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: "Action",
            key: "action",
            width: 200,
            render: (_, record) => {
                const status = record.status?.toUpperCase();
                return (
                    <Space>
                        <Button size="small"
                                icon={<EyeOutlined style={{color: '#008ECC'}}/>}
                                style={{borderColor: '#008ECC'}}
                                onClick={() => handleView(record)}>
                            View
                        </Button>

                        {status === 'REQUESTED' && (
                            <>
                                <Button size="small"
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        style={{backgroundColor: '#52c41a', borderColor: '#52c41a'}}
                                        onClick={() => handleStatusChange(record.id, 'APPROVED')}>
                                    Approve
                                </Button>

                                <Button size="small"
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => handleStatusChange(record.id, 'REJECTED')}>
                                    Reject
                                </Button>
                            </>
                        )}
                    </Space>
                )
            }
        }
    ];

    const tabItems = [
        {
            key: 'ALL',
            label: <span><InboxOutlined /> All</span>
        },
        {
            key: 'REQUESTED',
            label: <span><ExclamationCircleOutlined /> Requested</span>
        },
        {
            key: 'APPROVED',
            label: <span><SyncOutlined spin /> Approved</span>
        },
        {
            key: 'COMPLETED',
            label: <span><CheckCircleOutlined /> Completed</span>
        },
        {
            key: 'REJECTED',
            label: <span><CloseOutlined /> Rejected</span>
        },
    ];

    return (
        <>
            {contextHolder}

            <div className="returns-page">
                <div className="page-header">
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Return Requests</Title>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <InboxOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>

                    <div className="stat-card requested">
                        <div className="stat-icon">
                            <ExclamationCircleOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.requested}</span>
                        </div>
                    </div>

                    <div className="stat-card approved">
                        <div className="stat-icon">
                            <SyncOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Approved</span>
                            <span className="stat-value">{stats.approved}</span>
                        </div>
                    </div>

                    <div className="stat-card completed">
                        <div className="stat-icon">
                            <CheckCircleOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{stats.completed}</span>
                        </div>
                    </div>

                    <div className="stat-card rejected">
                        <div className="stat-icon">
                            <CloseOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Rejected</span>
                            <span className="stat-value">{stats.rejected}</span>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

                    <div className="table-actions">
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            style={{ width: 350 }}
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
                footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                width={700}
                centered
            >
                {selectedReturn && (
                    <div style={{paddingTop: 10}}>
                        <div className="return-modal-header">
                            <Title level={4} style={{margin:0}}>Return Request</Title>
                            <Text type="secondary">ID: {selectedReturn.id}</Text>
                            <div style={{marginTop: 10}}>
                                {getStatusBadge(selectedReturn.status)}
                            </div>
                        </div>

                        <div className="return-section-title"><UserOutlined /> Customer Information</div>
                        <Descriptions size="small" bordered column={1}>
                            <Descriptions.Item label="Username">
                                {selectedReturn.Order?.Customer?.User?.username || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedReturn.Order?.Customer?.User?.email || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{marginTop: 16}}>
                            <div className="return-section-title" style={{marginBottom: 8}}>
                                <FileTextOutlined /> Return Reason
                            </div>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fff',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                minHeight: '80px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                color: '#595959',
                                fontSize: '14px'
                            }}>
                                {selectedReturn.reason}
                            </div>
                        </div>

                        <Divider dashed />

                        <div className="return-section-title"><CreditCardOutlined /> Order & Payment Info</div>
                        <Descriptions size="small" bordered column={2}>
                            <Descriptions.Item label="Order ID" span={2}>
                                <Text code copyable>{selectedReturn.Order?.id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Order Date" span={2}>
                                {dayjs(selectedReturn.Order?.orderDate).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>

                            <Descriptions.Item label="Payment Method">
                                <Tag color="blue">{selectedReturn.Order?.Payment?.[0]?.method || "N/A"}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Status">
                                <Badge
                                    status={selectedReturn.Order?.Payment?.[0]?.status === 'COMPLETED' ? 'success' : 'warning'}
                                    text={selectedReturn.Order?.Payment?.[0]?.status}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Amount" span={2}>
                                <Text strong style={{fontSize: 16, color: '#008ECC'}}>
                                    {formatCurrency(selectedReturn.Order?.Payment?.[0]?.amount || 0)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider dashed />

                        <div className="return-section-title"><ShoppingOutlined /> Products in Order</div>

                        <div className="scope-list-container" style={{maxHeight: 300, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: '0 10px'}}>
                            <List
                                itemLayout="horizontal"
                                dataSource={selectedReturn.Order?.OrderItem || []}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Image width={50} height={50} src={item.ProductVariant?.Product?.images?.[0] || "https://placehold.co/50"} style={{borderRadius: 4, objectFit: 'cover'}} />}
                                            title={<span>{item.ProductVariant?.Product?.name}</span>}
                                            description={
                                                <Space orientation="vertical" size={0}>
                                                    <Space size={4}>
                                                        {Object.entries(item.ProductVariant?.variantAttributes || {}).map(([k, v]) => (
                                                            <Tag key={k} style={{fontSize: 10}}>{k}: {v}</Tag>
                                                        ))}
                                                    </Space>
                                                    <Text type="secondary" style={{fontSize: 13}}>
                                                        Qty: {item.quantity} x {formatCurrency(item.ProductVariant?.Product?.price + (item.ProductVariant?.priceAdjustment || 0))}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                        <div>
                                            <Text strong>{formatCurrency((item.ProductVariant?.Product?.price + (item.ProductVariant?.priceAdjustment || 0)) * item.quantity)}</Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>

                        {selectedReturn.status === 'REQUESTED' && (
                            <div style={{marginTop: 20, textAlign: 'right'}}>
                                <Space>
                                    <Button danger onClick={() => {
                                        handleStatusChange(selectedReturn.id, 'REJECTED');
                                        setIsViewModalOpen(false);
                                    }}>Reject Request</Button>
                                    <Button type="primary" onClick={() => {
                                        handleStatusChange(selectedReturn.id, 'APPROVED');
                                        setIsViewModalOpen(false);
                                    }}>Approve Request</Button>
                                </Space>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Returns;