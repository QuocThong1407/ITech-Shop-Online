import React, {useState, useEffect, useCallback} from "react";
import promotionService from "../../../services/promotionService";
import productService from "../../../services/productService";
import categoryService from "../../../services/categoryService";
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
    DatePicker,
    Upload,
    Space,
    Row,
    Col,
    Badge,
    Image,
    Tabs,
    Select,
    Empty,
    List,
    Avatar,
    Divider
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    GiftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    GlobalOutlined,
    AppstoreOutlined,
    ShoppingCartOutlined,
    PictureOutlined,
    CalendarOutlined,
    PauseCircleOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import "./Promotions.css";

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;
const {TextArea} = Input;

const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

const Promotions = () => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [stats, setStats] = useState({total: 0, active: 0, upcoming: 0, expired: 0, inactive: 0});

    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const [previewOpen, setPreviewOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [selectedPromo, setSelectedPromo] = useState(null);

    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [scopeType, setScopeType] = useState('ALL');

    const [messageApi, contextHolder] = message.useMessage();

    const fetchResources = async () => {
        try {
            const userRes = await userService.getCurrentUser();
            const sellerId = userRes?.data?.id;

            const [prodRes, catRes] = await Promise.all([productService.getAllProducts({
                page: 1,
                limit: 1000,
                createdBy: sellerId
            }), categoryService.getAllCategories()]);

            if (prodRes?.data?.products) {
                setAllProducts(prodRes.data.products.map(p => ({label: p.name, value: p.id, image: p.images?.[0]})));
            }
            if (catRes?.data) {
                const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data.categories || [];
                setAllCategories(cats.map(c => ({label: c.name, value: c.id})));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await promotionService.getAllPromotions({page: 1, limit: 1000, search: searchText});
            if (response?.data) {
                const promotions = response.data.promotions || [];
                setData(promotions);

                let active = 0, upcoming = 0, expired = 0, inactive = 0;
                promotions.forEach(p => {
                    const st = p.status ? p.status.toUpperCase() : 'UNKNOWN';
                    if (st === 'ACTIVE') active++;
                    else if (st === 'UPCOMING') upcoming++;
                    else if (st === 'EXPIRED') expired++;
                    else if (st === 'INACTIVE') inactive++;
                });
                setStats({total: promotions.length, active, upcoming, expired, inactive});
            }
        } catch {
            messageApi.error("Failed to load promotions");
        } finally {
            setLoading(false);
        }
    }, [searchText, messageApi]);

    useEffect(() => {
        let res = [...data];

        if (activeTab !== 'ALL') {
            res = res.filter(p => p.status?.toUpperCase() === activeTab);
        }

        setFilteredData(res);

        setPagination(prev => ({
            ...prev,
            total: res.length,
            current: 1
        }));
    }, [data, activeTab]);

    useEffect(() => {
        fetchResources();
        fetchPromotions();
    }, [fetchPromotions]);

    const handleUploadChange = ({fileList: newFileList}) => {
        setFileList(newFileList);
        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            getBase64(newFileList[0].originFileObj).then(url => setPreviewImage(url));
        } else {
            setPreviewImage('');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
        form.resetFields();
        setFileList([]);
        setPreviewImage('');
        setScopeType('ALL');
    };

    const handleOpenModal = async (record = null) => {
        setEditingPromo(record);
        if (record) {
            let details = record;
            if (!record.products && !record.categories) {
                try {
                    const res = await promotionService.getPromotionById(record.id);
                    details = res.data?.promotion || res.data || record;
                } catch (e) {
                    console.error("Fetch details for edit failed", e);
                }
            }

            form.setFieldsValue({
                name: details.name,
                description: details.description,
                dateRange: [dayjs.utc(details.startDate), dayjs.utc(details.endDate)],
            });

            if (details.products && details.products.length > 0) {
                setScopeType('PRODUCT');
                form.setFieldsValue({productIds: details.products.map(p => p.id || p)});
            } else if (details.categories && details.categories.length > 0) {
                setScopeType('CATEGORY');
                form.setFieldsValue({categoryIds: details.categories.map(c => c.id || c)});
            } else {
                setScopeType('ALL');
            }

            if (details.image) {
                setFileList([{uid: '-1', name: 'banner.png', status: 'done', url: details.image}]);
                setPreviewImage(details.image);
            } else {
                setFileList([]);
                setPreviewImage('');
            }
        } else {
            form.resetFields();
            setScopeType('ALL');
            setFileList([]);
            setPreviewImage('');
        }
        setIsModalOpen(true);
    };

    const handleView = async (record) => {
        try {
            const response = await promotionService.getPromotionById(record.id);
            const fullDetail = response.data || record;
            setSelectedPromo(fullDetail);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error("View detail error", error);
            messageApi.error("Could not load details");
        }
    };

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            formData.append('name', values.name);
            formData.append('description', values.description || '');

            if (values.dateRange) {
                const startStr = values.dateRange[0].format('YYYY-MM-DD HH:mm:ss');
                const endStr = values.dateRange[1].format('YYYY-MM-DD HH:mm:ss');

                formData.append('startDate', dayjs.utc(startStr).toISOString());
                formData.append('endDate', dayjs.utc(endStr).toISOString());
            }
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

            let promoId;

            if (editingPromo) {
                promoId = editingPromo.id;
                await promotionService.updatePromotion(promoId, formData);
                messageApi.success("Promotion updated");
            } else {
                const res = await promotionService.createPromotion(formData);
                promoId = res.data?.id || res.data?.data?.id || (res.data && res.data.id);
                messageApi.success("Promotion created");
            }

            if (promoId) {
                if (scopeType === 'ALL') {
                    const allCatIds = allCategories.map(c => c.value);
                    if (allCatIds.length > 0) {
                        await promotionService.applyToCategories(promoId, allCatIds);
                    }
                } else if (scopeType === 'CATEGORY' && values.categoryIds?.length > 0) {
                    await promotionService.applyToCategories(promoId, values.categoryIds);
                } else if (scopeType === 'PRODUCT' && values.productIds?.length > 0) {
                    await promotionService.applyToProducts(promoId, values.productIds);
                }
            }

            handleCloseModal();
            await fetchPromotions();

        } catch (error) {
            console.error(error);
            messageApi.error("Operation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Delete Promotion?",
            content: "Are you sure you want to delete this promotion?",
            okType: 'danger',
            onOk: async () => {
                try {
                    await promotionService.deletePromotion(id);
                    messageApi.success("Deleted successfully");
                    await fetchPromotions();
                } catch {
                    messageApi.error("Delete failed");
                }
            }
        });
    };

    const renderAppliedScope = (promo) => {
        if (promo.products && promo.products.length > 0) {
            return (
                <div className="view-scope-section">
                    <Text strong style={{marginBottom: 12, display: 'block', fontSize: 15}}>
                        <ShoppingCartOutlined/> Applied Products ({promo.products.length})
                    </Text>
                    <div className="scope-list-container">
                        <List
                            itemLayout="horizontal"
                            dataSource={promo.products}
                            size="small"
                            renderItem={(item) => (
                                <List.Item style={{marginBottom: 0}}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.images?.[0] || "https://placehold.co/50"}
                                                        style={{width:50, height:50}}
                                                        shape="square"/>}
                                        title={<Text style={{fontSize: 14, fontWeight: 500,}}>{item.name}</Text>}
                                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}
                                        description={<Text type="secondary" style={{fontSize: 11}}>{item.sku || `ID: ${item.id?.substring(0, 8)}...`}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            );
        }

        if (promo.categories && promo.categories.length > 0) {
            return (
                <div className="view-scope-section">
                    <Text strong style={{marginBottom: 12, display: 'block', fontSize: 15}}>
                        <AppstoreOutlined/> Applied Categories ({promo.categories.length})
                    </Text>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                        {promo.categories.map(cat => (
                            <Tag key={cat.id} color="geekblue" style={{padding: '6px 12px', fontSize: 13}}>
                                {cat.name}
                            </Tag>))}
                    </div>
                </div>
            );
        }

        return (
            <div className="view-scope-section"
                 style={{textAlign: 'center', padding: '24px 0', background: '#fafafa', borderRadius: 8}}>
                <GlobalOutlined style={{fontSize: 32, color: '#faad14', marginBottom: 10}}/>
                <div style={{fontWeight: 600, fontSize: 15}}>Entire Store</div>
                <Text type="secondary">This promotion applies to all products.</Text>
            </div>
        );
    };

    const columns = [{
        title: "Promotion",
        key: "info",
        width: 400,
        render: (_, record) => (
            <div className="promo-cell">
                <div className="promo-img-wrapper">
                    <Image
                        src={record.image || "https://placehold.co/200x120?text=No+Img"}
                        className="promo-img-preview"
                        fallback="https://placehold.co/200x120?text=Error"
                    />
                </div>
                <div className="promo-info">
                    <span className="promo-name-text">{record.name}</span>
                    <span className="promo-desc-text">{record.description || "No description provided."}</span>
                </div>
            </div>
        )
    },
        {
            title: "Duration",
            key: "duration",
            width: 250,
            render: (_, record) => {
                const start = dayjs.utc(record.startDate);
                const end = dayjs.utc(record.endDate);
                const diffDays = end.diff(start, 'day');
                const diffHours = end.diff(start, 'hour') % 24;

                return (<div className="duration-column">
                    <div className="duration-row">
                        <CalendarOutlined style={{color: '#1890ff', fontSize: 14}}/>
                        <span style={{fontSize: 14}}>{start.format("DD/MM/YYYY")} - {end.format("DD/MM/YYYY")}</span>
                    </div>
                    <div>
                        <Text type="secondary" style={{fontSize: 12, marginLeft: 24}}>
                            <ClockCircleOutlined/> Total: {diffDays} days {diffHours > 0 ? `${diffHours}h` : ''}
                        </Text>
                    </div>
                </div>)
            }
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            width: 150,
            render: (d) => <span style={{color: '#888', fontSize: 16}}>{dayjs(d).format("DD/MM/YYYY")}</span>
        },
        {
            title: "Status",
            key: "status",
            width: 150,
            align: 'center',
            render: (_, record) => {
                const status = record.status ? record.status.toUpperCase() : 'UNKNOWN';
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
            align: 'center',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button size="small"
                            style={{borderColor: '#008ECC'}}
                            icon={<EyeOutlined style={{color: '#008ECC'}}/>}
                            onClick={() => handleView(record)}>
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
                </Space>)
        }];

    const items = [
        {
            key: '1',
            label: <span><GiftOutlined/> General Info</span>,
            children: (
                <div style={{paddingTop: 8}}>
                    <Form.Item name="name" label="Promotion Name" rules={[{required: true}]}>
                        <Input placeholder="e.g. Flash Sale" size="large"/>
                    </Form.Item>

                    <Form.Item name="dateRange" label="Duration" rules={[{required: true}]}>
                        <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{width: '100%'}} size="large"/>
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} placeholder="Details..."/>
                    </Form.Item>

                    <Form.Item label="Banner Image (One Image Only)">
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                            maxCount={1}
                            accept="image/*"
                            className="promo-big-upload">
                            {previewImage ? (<img src={previewImage} alt="banner" className="uploaded-banner-image"/>) :
                                (
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <PictureOutlined style={{fontSize: 32, color: '#999'}}/>
                                        <div style={{marginTop: 8, color: '#666'}}>Click to Upload Banner</div>
                                    </div>
                                )
                            }
                        </Upload>
                    </Form.Item>
                </div>),
        },
        {
            key: '2',
            label: <span><GlobalOutlined/> Scope</span>,
            children: (
                <div style={{paddingTop: 8}}>
                    <div className="scope-selection-container">
                        <div className={`scope-card ${scopeType === 'ALL' ? 'selected' : ''}`}
                             onClick={() => setScopeType('ALL')}>
                            <div className="scope-card-icon"><GlobalOutlined/></div>
                            <div className="scope-card-title">Entire Store</div>
                        </div>
                        <div className={`scope-card ${scopeType === 'CATEGORY' ? 'selected' : ''}`}
                             onClick={() => setScopeType('CATEGORY')}>
                            <div className="scope-card-icon"><AppstoreOutlined/></div>
                            <div className="scope-card-title">Categories</div>
                        </div>
                        <div className={`scope-card ${scopeType === 'PRODUCT' ? 'selected' : ''}`}
                             onClick={() => setScopeType('PRODUCT')}>
                            <div className="scope-card-icon"><ShoppingCartOutlined/></div>
                            <div className="scope-card-title">Products</div>
                        </div>
                    </div>

                    <div style={{minHeight: 150, padding: 16, background: '#f9f9f9', borderRadius: 8}}>
                        {scopeType === 'ALL' && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                       description="Will apply to all categories (Entire Store)."/>}
                        {scopeType === 'CATEGORY' && (
                            <Form.Item name="categoryIds"
                                       label="Select Categories"
                                       rules={[{
                                           required: true,
                                           message: 'Select at least one'
                                       }]}>
                                <Select mode="multiple"
                                        placeholder="Select categories..."
                                        style={{width: '100%'}}
                                        size="large"
                                        options={allCategories}/>
                            </Form.Item>
                        )}
                        {scopeType === 'PRODUCT' && (
                            <Form.Item name="productIds"
                                       label="Select Products"
                                       rules={[{
                                           required: true,
                                           message: 'Select at least one'
                                       }]}>
                                <Select mode="multiple"
                                        placeholder="Search products..."
                                        style={{width: '100%'}}
                                        size="large" options={allProducts}
                                        showSearch optionFilterProp="label"
                                        maxTagCount={5}/>
                            </Form.Item>
                        )}
                    </div>
                </div>
            ),
        },
    ];


    const tabItems = [
        {
            key: 'ALL',
            label: <span><AppstoreOutlined/> All</span>
        },
        {
            key: 'ACTIVE',
            label: <span><CheckCircleOutlined/> Active</span>
        },
        {
            key: 'UPCOMING',
            label: <span><ClockCircleOutlined/> Upcoming</span>
        },
        {
            key: 'EXPIRED',
            label: <span><StopOutlined/> Expired</span>
        },
        {
            key: 'INACTIVE',
            label: <span><PauseCircleOutlined/> Inactive</span>
        },
    ];

    return (
        <>
            {contextHolder}

            <div className="promotion-page">
                <div className="page-header">
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Promotions</Title>
                    <Button type="primary"
                            icon={<PlusOutlined/>}
                            style={{backgroundColor: '#008ECC'}}
                            onClick={() => handleOpenModal(null)}>
                        Create Promotion
                    </Button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon"><GiftOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>

                    <div className="stat-card active">
                        <div className="stat-icon"><CheckCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Active</span>
                            <span className="stat-value">{stats.active}</span>
                        </div>
                    </div>

                    <div className="stat-card upcoming">
                        <div className="stat-icon"><ClockCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Upcoming</span>
                            <span className="stat-value">{stats.upcoming}</span>
                        </div>
                    </div>

                    <div className="stat-card expired">
                        <div className="stat-icon"><StopOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Expired</span>
                            <span className="stat-value">{stats.expired}</span>
                        </div>
                    </div>

                    <div className="stat-card inactive">
                        <div className="stat-icon"><PauseCircleOutlined/></div>

                        <div className="stat-info">
                            <span className="stat-label">Inactive</span>
                            <span className="stat-value">{stats.inactive}</span>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems}/>

                    <div className="table-actions">
                        <Input placeholder="Search promotion..."
                               prefix={<SearchOutlined style={{color: '#ccc'}}/>}
                               style={{width: 380}}
                               onChange={(e) => setSearchText(e.target.value)}
                               allowClear/>
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
                title={<Title level={4} style={{margin: 0}}>{editingPromo ? "Edit Promotion" : "New Promotion"}</Title>}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                confirmLoading={actionLoading}
                okText={editingPromo ? "Save Changes" : "Create"}
                width={720}
                centered
            >
                <Form form={form} layout="vertical">
                    <Tabs defaultActiveKey="1" items={items} type="line"/>
                </Form>
            </Modal>

            <Modal
                title="Promotion Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
                centered
                width={700}
                className="promotion-view-modal"
            >
                {selectedPromo && (<div className="view-modal-content">
                    <div style={{textAlign: 'center', marginBottom: 24}}>
                        <Image
                            width="100%"
                            height={200}
                            style={{objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0'}}
                            src={selectedPromo.image || "https://placehold.co/600x200?text=Promotion"}
                        />
                        <Title level={3} style={{marginTop: 16, marginBottom: 8}}>{selectedPromo.name}</Title>

                        {(() => {
                            const status = selectedPromo.status?.toUpperCase() || 'UNKNOWN';
                            let color = 'default';
                            if (status === 'ACTIVE') color = 'success';
                            else if (status === 'UPCOMING') color = 'processing';
                            else if (status === 'EXPIRED') color = 'error';

                            return <Badge status={color}
                                          text={<span style={{fontSize: 16, fontWeight: 500}}>{status}</span>}/>;
                        })()}
                    </div>

                    <Row gutter={[24, 24]} style={{marginBottom: 24}}>
                        <Col span={24}>
                            <div style={{background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0'}}>
                                <Space orientation="vertical" size={12} style={{width: '100%'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <CalendarOutlined style={{fontSize: 18, color: '#1890ff', marginRight: 10}}/>

                                        <div>
                                            <Text type="secondary" style={{fontSize: 12}}>Period</Text>

                                            <div style={{fontWeight: 600}}>
                                                {dayjs(selectedPromo.startDate).format("DD/MM/YYYY HH:mm")} — {dayjs(selectedPromo.endDate).format("DD/MM/YYYY HH:mm")}
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{margin: '4px 0'}}/>

                                    <div>
                                        <Text type="secondary" style={{fontSize: 12}}>Description</Text>

                                        <div style={{color: '#555'}}>{selectedPromo.description || "No description provided."}</div>
                                    </div>
                                </Space>
                            </div>
                        </Col>
                    </Row>

                    {renderAppliedScope(selectedPromo)}
                </div>)}
            </Modal>

            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </>);
};

export default Promotions;