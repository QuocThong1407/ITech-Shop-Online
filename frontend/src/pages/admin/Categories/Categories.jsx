import React, { useState, useEffect, useCallback } from "react";
import categoryService from "../../../services/categoryService.js";
import productService from "../../../services/productService.js";
import {
    Button,
    Input,
    message,
    Modal,
    Table,
    Typography,
    Form,
    Upload,
    Space,
    Tooltip,
    Image,
    List,
    Avatar,
    Tag,
    Row,
    Col,
    Empty
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    PictureOutlined,
    FolderOpenOutlined,
    EyeOutlined,
    TrophyOutlined,
    ShoppingOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./Categories.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const Category = () => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [stats, setStats] = useState({
        total: 0,
        topCategories: []
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');

    const [messageApi, contextHolder] = message.useMessage();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories({ search: searchText });
            const categories = response.data?.categories || response.data || [];
            setData(categories);
            setPagination(prev => ({
                ...prev,
                total: categories.length
            }));

            const statsRes = await categoryService.getCategoryStats();
            if (statsRes?.data) {
                setStats({
                    total: statsRes.data.total || 0,
                    topCategories: statsRes.data.topCategories || []
                });
            }

        } catch (error) {
            console.error(error);
            messageApi.error("Failed to load categories data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let res = [...data];

        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            res = res.filter(item =>
                item.name?.toLowerCase().includes(lowerSearch) ||
                item.description?.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredData(res);
    }, [data, searchText]);

    useEffect(() => {
        fetchCategories();
    }, [searchText, messageApi]);

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);

        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            getBase64(newFileList[0].originFileObj).then(url => setPreviewImage(url));
        }
        else {
            setPreviewImage('');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
        setFileList([]);
        setPreviewImage('');
    };

    const handleOpenModal = (record = null) => {
        setEditingCategory(record);

        if (record) {
            form.setFieldsValue({
                name: record.name,
                description: record.description,
            });

            if (record.image) {
                setPreviewImage(record.image);
                setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: record.image }]);
            }
            else {
                setPreviewImage('');
                setFileList([]);
            }
        }
        else {
            form.resetFields();
            setPreviewImage('');
            setFileList([]);
        }

        setIsModalOpen(true);
    };

    const handleViewDetails = async (category) => {
        setViewingCategory(category);
        setIsViewModalOpen(true);
        setProductsLoading(true);
        setCategoryProducts([]);

        try {
            const res = await productService.getProductsByCategoryId(category.id);
            setCategoryProducts(res.data?.products || res.data || []);
        }
        catch (error) {
            console.error(error);
            messageApi.error("Failed to load products");
        }
        finally {
            setProductsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            formData.append('name', values.name);
            formData.append('description', values.description || '');

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, formData);
                messageApi.success("Category updated successfully");
            }
            else {
                await categoryService.createCategory(formData);
                messageApi.success("Category created successfully");
            }

            handleCloseModal();
            fetchCategories();
        }
        catch (error) {
            console.error(error);
            messageApi.error("Operation failed");
        }
        finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Delete Category?",
            content: "Are you sure you want to delete this category? Products linked to it might be affected.",
            okType: 'danger',
            onOk: async () => {
                try {
                    await categoryService.deleteCategory(id);
                    messageApi.success("Deleted successfully");
                    fetchCategories();
                } catch (error) {
                    messageApi.error("Delete failed");
                }
            }
        });
    };

    const columns = [
        {
            title: "Image",
            key: "image",
            width: 100,
            align: 'center',
            render: (_, record) => (
                <div className="category-img-wrapper">
                    <Image
                        src={record.image || "https://placehold.co/100x100?text=No+Img"}
                        fallback="https://placehold.co/100x100?text=Error"
                        className="category-img"
                    />
                </div>
            )
        },
        {
            title: "Category Name",
            dataIndex: "name",
            key: "name",
            width: 250,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => <Text type="secondary">{text || "No description"}</Text>
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            width: 150,
            render: (date) => <span style={{color: '#888', fontSize: 14}}>{dayjs(date).format("DD/MM/YYYY")}</span>
        },
        {
            title: "Action",
            key: "action",
            width: 250,
            render: (_, record) => (
                <Space>
                    <Button size="small"
                            style={{borderColor: '#008ECC'}}
                            icon={<EyeOutlined style={{color: '#008ECC'}}/>}
                            onClick={() => handleViewDetails(record)}>
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
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <>
            {contextHolder}

            <div className="category-page">
                <div className="page-header">
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Categories</Title>
                    <Button type="primary"
                            icon={<PlusOutlined />}
                            style={{backgroundColor:'#008ECC'}}
                            onClick={() => handleOpenModal(null)}>
                        Add Category
                    </Button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon"><FolderOpenOutlined /></div>

                        <div className="stat-info">
                            <span className="stat-label">Total Categories</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>
                    {stats.topCategories.map((cat, index) => (
                        <div className="stat-card top" key={cat.id || index}>
                            <div className="stat-icon"><TrophyOutlined /></div>
                            <div className="stat-info">
                                <span className="stat-label">#{index + 1} {cat.name}</span>
                                <span className="stat-value">{cat.productCount}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="table-card">
                    <div className="table-actions">
                        <Input
                            placeholder="Search category by name..."
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
                        scroll={{ x: "max-content" }}
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
                title={<Title level={4} style={{margin:0}}>{editingCategory ? "Edit Category" : "New Category"}</Title>}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                confirmLoading={actionLoading}
                okText={editingCategory ? "Save Changes" : "Create"}
                width={500}
                centered
            >
                <Form form={form} layout="vertical" style={{marginTop: 16}}>
                    <Form.Item label="Category Image">
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                            maxCount={1}
                            accept="image/*"
                            className="category-upload"
                        >
                            {previewImage ? (
                                <img src={previewImage} alt="category" className="category-upload-preview" />
                            ) : (
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <PictureOutlined style={{fontSize: 24, color: '#999', marginBottom: 8}}/>
                                    <div style={{color: '#666'}}>Upload Image</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g. Electronics" size="large" prefix={<AppstoreOutlined style={{color:'#ccc'}}/>} />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={4} placeholder="Short description..." />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Category Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
                width={700}
                centered
            >
                {viewingCategory && (
                    <div style={{paddingTop: 10}}>
                        <div className="category-view-header">
                            <Row gutter={[24, 24]} align="middle">
                                <Col span={6}>
                                    <Image
                                        src={viewingCategory.image || "https://placehold.co/150x150?text=No+Img"}
                                        className="category-view-img"
                                    />
                                </Col>
                                <Col span={18}>
                                    <Title level={3} style={{margin: '0 0 8px 0'}}>{viewingCategory.name}</Title>
                                    <Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{marginBottom: 12}}>
                                        {viewingCategory.description || "No description provided."}
                                    </Paragraph>
                                    <Space size="middle">
                                        <Tag icon={<CalendarOutlined />} color="blue">
                                            Created: {dayjs(viewingCategory.createdAt).format("DD/MM/YYYY")}
                                        </Tag>
                                        <Tag icon={<ShoppingOutlined />} color="purple">
                                            Products: {categoryProducts.length}
                                        </Tag>
                                    </Space>
                                </Col>
                            </Row>
                        </div>

                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
                            <Title level={5} style={{margin:0}}><ShoppingOutlined /> Products in Category</Title>
                        </div>

                        <div className="product-list-container">
                            <List
                                loading={productsLoading}
                                itemLayout="horizontal"
                                dataSource={categoryProducts}
                                locale={{ emptyText: <Empty description="No products found in this category" /> }}
                                renderItem={(item) => (
                                    <List.Item actions={[<Button size="small" type="link" href="/admin/products" target="_blank">Manage</Button>]}>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    shape="square"
                                                    size={64}
                                                    src={item.images?.[0]}
                                                    icon={<PictureOutlined />}
                                                    style={{backgroundColor: '#f5f5f5'}}
                                                />
                                            }
                                            title={<Text strong>{item.name}</Text>}
                                            description={
                                                <Space direction="vertical" size={0}>
                                                    <Text type="secondary" style={{fontSize: 12}}>Price: {formatCurrency(item.price)}</Text>
                                                    <Space size={8}>
                                                        {item.stockQuantity <= 5 ? (
                                                            <Tag color="red" style={{fontSize:10}}>Low Stock: {item.stockQuantity}</Tag>
                                                        ) : (
                                                            <Tag color="green" style={{fontSize:10}}>Stock: {item.stockQuantity}</Tag>
                                                        )}
                                                        <Tag style={{fontSize:10}}>ID: {item.id?.substring(0,8)}</Tag>
                                                    </Space>
                                                </Space>
                                            }
                                        />
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

export default Category;