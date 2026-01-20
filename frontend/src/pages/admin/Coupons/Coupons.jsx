import React, {useState, useEffect, useCallback} from "react";
import couponService from "../../../services/couponService";
import promotionService from "../../../services/promotionService";
import userService from "../../../services/userService";
import {
    Button,
    Input,
    message,
    Modal,
    Table,
    Typography,
    Form,
    Tag,
    Tooltip,
    Select,
    Space,
    Badge,
    Tabs,
    Row,
    Col,
    Progress,
    InputNumber
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    StopOutlined,
    PauseCircleOutlined,
    TagOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./Coupons.css";

const {Title, Text} = Typography;

const Coupons = () => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [promotionList, setPromotionList] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState('ALL');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        upcoming: 0,
        expired: 0,
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    })

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();


    useEffect(() => {
        const fetchPromotionList = async () => {
            try {
                const userRes = await userService.getCurrentUser();
                const sellerId = userRes?.data?.id;

                const res = await promotionService.getAllPromotions({
                    page: 1,
                    limit: 1000,
                    createdBy: sellerId
                })

                if (res && res.data) {
                    setPromotionList(res.data.promotions.map(p => ({
                        label: `${p.name} (${dayjs(p.startDate).format('DD/MM')} - ${dayjs(p.endDate).format('DD/MM')})`,
                        value: p.id,
                        status: p.status
                    })));
                }
            } catch (error) {
                console.error("Fetch promotions failed", error);
            }
        }

        fetchPromotionList();
    }, [])

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await couponService.getAllCoupons({
                page: 1,
                limit: 1000,
                search: searchText,
            });

            if (res && res.data) {
                const coupons = res.data.coupons;
                setData(coupons);

                console.log(coupons);

                let active = 0, upcoming = 0, expired = 0, inactive = 0;
                coupons.forEach(c => {
                    const st = c.Promotion?.status ? c.Promotion.status.toUpperCase() : 'UNKNOWN';
                    if (st === 'ACTIVE') active++;
                    else if (st === 'UPCOMING') upcoming++;
                    else if (st === 'EXPIRED') expired++;
                    else if (st === 'INACTIVE') inactive++;
                });
                setStats({total: coupons.length, active, upcoming, expired, inactive});
            }
        } catch (error) {
            messageApi.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCoupons();
    }, [searchText, messageApi]);

    useEffect(() => {
        let res = [...data];

        if (activeTab !== 'ALL') {
            res = res.filter(c => c.Promotion?.status?.toUpperCase() === activeTab);
        }

        setFilteredData(res);
        setPagination(prev => ({
            ...prev,
            total: res.length,
            current: 1
        }));
    }, [data, activeTab]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        form.resetFields();
    }

    const handleOpenModal = (record = null) => {
        setEditingCoupon(record);

        if (record) {
            form.setFieldsValue({
                code: record.code,
                promotionId: record.promotionId,
                discountPercentage: record.discountPercentage,
                maxUsage: record.maxUsage,
                usageCount: record.usageCount,
            })
        } else {
            form.resetFields();
        }

        setIsModalOpen(true);
    }

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            const values = await form.validateFields();
            const payload = {
                code: values.code,
                discountPercentage: values.discountPercentage,
                maxUsage: values.maxUsage,
                promotionId: values.promotionId,
            }

            if (editingCoupon) {
                await couponService.updateCoupon(editingCoupon.id, payload);
                messageApi.success("Coupon updated successfully");
            } else {
                await couponService.createCoupon(payload);
                messageApi.success("Coupon created successfully");
            }

            handleCloseModal();
            fetchCoupons();
        } catch (error) {
            console.error(error);
            messageApi.error(error.response?.data?.message || "Operation failed");
        } finally {
            setActionLoading(false);
        }
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Delete Coupon?",
            content: "Are you sure you want to remove this coupon?",
            okType: 'danger',
            onOk: async () => {
                try {
                    await couponService.deleteCoupon(id);
                    messageApi.success("Deleted successfully");
                    fetchCoupons();
                } catch (error) {
                    messageApi.error("Delete failed");
                }
            }
        });
    };

    const columns = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: (code) => <span className="coupon-code-tag">{code}</span>
        },
        {
            title: "Promotion Applied",
            key: "promotion",
            width: 250,
            render: (_, record) => (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text strong style={{fontSize: 14}}>{record.Promotion?.name || "No Promotion"}</Text>
                    {record.Promotion && (
                        <Text type="secondary" style={{fontSize: 12}}>
                            {dayjs(record.Promotion.startDate).format("DD/MM/YYYY")} - {dayjs(record.Promotion.endDate).format("DD/MM/YYYY")}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: "Discount",
            dataIndex: "discountPercentage",
            key: "discountPercentage",
            width: 120,
            align: 'center',
            render: (val) => (
                <Tag color="volcano" style={{fontWeight: 600, fontSize: 13, padding: '4px 8px'}}>
                    {val ? `${val}% OFF` : '0% OFF'}
                </Tag>
            )
        },
        {
            title: "Usage",
            key: "usage",
            width: 180,
            render: (_, record) => {
                const percent = record.maxUsage > 0 ? Math.round((record.usageCount / record.maxUsage) * 100) : 0;
                return (
                    <div style={{width: 140}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            marginBottom: 2,
                            color: '#666'
                        }}>
                            <span>{record.usageCount} used</span>
                            <span>{record.maxUsage} max</span>
                        </div>
                        <Progress percent={percent} size="small" status={percent >= 100 ? "exception" : "active"}
                                  showInfo={false} strokeColor={percent >= 100 ? "#ff4d4f" : "#1890ff"}/>
                    </div>
                )
            }
        },
        {
            title: "Status",
            key: "status",
            width: 140,
            align: 'center',
            render: (_, record) => {
                const status = record.Promotion?.status?.toUpperCase() || 'UNKNOWN';
                let color = 'default';

                if (status === 'ACTIVE') color = 'success';
                else if (status === 'UPCOMING') color = 'processing';
                else if (status === 'EXPIRED') color = 'error';
                else if (status === 'INACTIVE') color = 'default';

                return <Badge status={color} text={status}/>;
            }
        },
        {
            title: "Action",
            key: "action",
            align: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small"
                            style={{borderColor: '#008ECC'}}
                            icon={<EyeOutlined style={{color: '#008ECC'}}/>}
                            onClick={() => {
                                setSelectedCoupon(record);
                                setIsViewModalOpen(true);
                            }}>
                        View
                    </Button>
                    <Button size="small"
                            style={{borderColor: '#faad14'}}
                            icon={<EditOutlined style={{color: '#faad14'}}/>}
                            onClick={() => handleOpenModal(record)}>
                        Edit
                    </Button>
                    <Button size="small"
                            danger
                            icon={<DeleteOutlined/>}
                            onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'ALL', label: <span><TagOutlined /> All</span> },
        { key: 'ACTIVE', label: <span><CheckCircleOutlined /> Active</span> },
        { key: 'UPCOMING', label: <span><ClockCircleOutlined /> Upcoming</span> },
        { key: 'EXPIRED', label: <span><StopOutlined /> Expired</span> },
        { key: 'INACTIVE', label: <span><PauseCircleOutlined /> Inactive</span> },
    ];

    return (
        <>
            {contextHolder}

            <div className="coupons-page">
                <div className="page-header">
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Promotions</Title>
                    <Button type="primary"
                            icon={<PlusOutlined />}
                            style={{backgroundColor:'#008ECC'}}
                            onClick={() => handleOpenModal(null)}>
                        Add Coupon
                    </Button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <TagOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Total Coupons</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>

                    <div className="stat-card active">
                        <div className="stat-icon">
                            <CheckCircleOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Active</span>
                            <span className="stat-value">{stats.active}</span>
                        </div>
                    </div>

                    <div className="stat-card upcoming">
                        <div className="stat-icon">
                            <ClockCircleOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Upcoming</span>
                            <span className="stat-value">{stats.upcoming}</span>
                        </div>
                    </div>

                    <div className="stat-card expired">
                        <div className="stat-icon">
                            <StopOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Expired</span>
                            <span className="stat-value">{stats.expired}</span>
                        </div>
                    </div>

                    <div className="stat-card inactive">
                        <div className="stat-icon">
                            <PauseCircleOutlined/>
                        </div>

                        <div className="stat-info">
                            <span className="stat-label">Inactive</span>
                            <span className="stat-value">{stats.inactive}</span>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

                    <div className="table-actions">
                        <Input
                            placeholder="Search coupon code..."
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
                            onChange: (page, pageSize) => setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize
                            }))
                        }}
                    />
                </div>
            </div>

            <Modal
                title={editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                confirmLoading={actionLoading}
                okText={editingCoupon ? "Save Changes" : "Create"}
                width={500}
                centered
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="code"
                        label="Coupon Code"
                        rules={[
                            { required: true, message: 'Please enter code' },
                        ]}
                    >
                        <Input placeholder="e.g. SUMMER2024"
                               size="large"
                               style={{textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1}} />
                    </Form.Item>

                    <Form.Item
                        name="discountPercentage"
                        label="Discount Percentage"
                        rules={[{ required: true, type: 'number', min: 0, max: 100, message: 'Must be between 0 and 100' }]}
                    >
                        <InputNumber
                            placeholder="e.g. 20"
                            size="large"
                            min={0}
                            max={100}
                            formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    {!editingCoupon && (
                        <Form.Item
                            name="promotionId"
                            label="Linked Promotion"
                            rules={[{ required: true, message: 'Please select a promotion' }]}
                            help="Coupon validity period and status will follow this promotion."
                        >
                            <Select
                                placeholder="Select a promotion..."
                                size="large"
                                options={promotionList}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="maxUsage"
                        label="Max Usage Limit"
                        rules={[{ required: true, type: 'number', min: 1, message: 'Must be at least 1' }]}
                    >
                        <InputNumber placeholder="e.g. 100" size="large" style={{width: '100%'}} min={1} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Coupon Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
                centered
                width={500}
            >
                {selectedCoupon && (
                    <div className="view-modal-content">
                        <div style={{textAlign:'center', marginBottom: 20}}>
                            <div className="coupon-code-tag" style={{fontSize: 28, display:'inline-block', marginBottom: 12, padding: '8px 20px'}}>
                                {selectedCoupon.code}
                            </div>

                            <div>
                                {(() => {
                                    const status = selectedCoupon.Promotion?.status?.toUpperCase() || 'UNKNOWN';
                                    let color = 'default';
                                    if (status === 'ACTIVE') color = 'success';
                                    else if (status === 'UPCOMING') color = 'processing';
                                    else if (status === 'EXPIRED') color = 'error';
                                    return <Badge status={color} text={<span style={{fontWeight:600}}>{status}</span>} />;
                                })()}
                            </div>
                        </div>

                        <div className="view-detail-row">
                            <Text type="secondary">Linked Promotion:</Text>
                            <Text strong>{selectedCoupon.Promotion?.name || "N/A"}</Text>
                        </div>

                        <div className="view-detail-row">
                            <Text type="secondary">Discount:</Text>
                            <Tag color="volcano" style={{fontSize: 14}}>{selectedCoupon.discountPercentage}% OFF</Tag>
                        </div>

                        <div className="view-detail-row">
                            <Text type="secondary">Valid Period:</Text>
                            <Text>
                                {selectedCoupon.Promotion
                                    ? `${dayjs(selectedCoupon.Promotion.startDate).format("DD/MM/YYYY")} - ${dayjs(selectedCoupon.Promotion.endDate).format("DD/MM/YYYY")}`
                                    : "N/A"
                                }
                            </Text>
                        </div>

                        <div style={{marginTop: 15, background: '#f9f9f9', padding: 15, borderRadius: 8}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 5}}>
                                <Text strong>Usage Statistics</Text>
                                <Text>{selectedCoupon.usageCount} / {selectedCoupon.maxUsage} used</Text>
                            </div>
                            <Progress
                                percent={Math.round((selectedCoupon.usageCount / selectedCoupon.maxUsage) * 100)}
                                status="active"
                                strokeColor="#1890ff"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}

export default Coupons;