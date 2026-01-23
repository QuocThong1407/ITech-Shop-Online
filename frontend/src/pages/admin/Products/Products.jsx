import React, {useState, useEffect, useMemo} from "react";
import productService from "../../../services/productService";
import productVariantService from "../../../services/productVariantService";
import categoryService from "../../../services/categoryService";
import userService from "../../../services/userService";
import {
    Button,
    Input,
    message,
    Modal,
    Table,
    Tabs,
    Typography,
    Form,
    Tag,
    Tooltip,
    InputNumber,
    Select,
    Image,
    Badge,
    Upload,
    Space,
    Card,
    Divider,
    Collapse,
    Switch,
    Row,
    Col, Alert
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ShopOutlined,
    InboxOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    CheckOutlined,
    CameraOutlined,
    UserOutlined
} from "@ant-design/icons";
import TextEditor from "../../../components/common/TextEditor/TextEditor.jsx"
import dayjs from 'dayjs';
import "../../admin/Products/Products.css";
import DescriptionEditor from "../../../components/common/DescriptionEditor/DescriptionEditor.jsx";
import DescriptionRenderer from "../../../components/common/DescriptionRenderer/DescriptionRenderer.jsx";

const {Title, Text} = Typography;
const {Option} = Select;

const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

const getVariantKey = (attributes) => {
    if (!attributes || typeof attributes !== 'object') return '';
    return Object.entries(attributes)
        .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(([k, v]) => `${k.toLowerCase()}:${String(v)}`)
        .join('|');
};

const Products = () => {
    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]); // State mới chứa danh sách Seller

    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [stats, setStats] = useState({total: 0, active: 0, lowStock: 0, outStock: 0});
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [variantTypeCards, setVariantTypeCards] = useState([]);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [editingTypeData, setEditingTypeData] = useState({name: '', options: []});
    const [variants, setVariants] = useState([]);
    const [activeCollapseKeys, setActiveCollapseKeys] = useState(['basic', 'variants']);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    });

    const generateVariantsFromCards = (cards, existingVariants = []) => {
        const typesWithOptions = cards.filter(c => c.options.length > 0);
        if (typesWithOptions.length === 0) return [];

        const combinations = [];
        const generate = (index, current) => {
            if (index === typesWithOptions.length) {
                combinations.push({...current});
                return;
            }
            const card = typesWithOptions[index];
            for (const option of card.options) {
                current[card.name] = option;
                generate(index + 1, {...current});
            }
        };
        generate(0, {});

        return combinations.map(attributes => {
            const key = getVariantKey(attributes);
            const existing = existingVariants.find(v => {
                const vAttrs = v.attributes || v.variantAttributes || {};
                return getVariantKey(vAttrs) === key;
            });

            if (existing) {
                return {
                    ...existing, enabled: existing.enabled !== false
                };
            }

            return {
                id: `temp-${Date.now()}-${Math.random()}`,
                attributes,
                quantity: 0,
                priceAdjustment: 0,
                imageFile: null,
                previewUrl: null,
                enabled: true,
                isImageDeleted: false
            };
        });
    };

    const syncVariants = (cards) => {
        const newVariants = generateVariantsFromCards(cards, variants);
        setVariants(newVariants);
    };

    const handleAddVariantType = () => {
        const newCard = {id: Date.now(), name: 'New Variant', options: []};
        const newCards = [...variantTypeCards, newCard];
        setVariantTypeCards(newCards);
        setEditingTypeId(newCard.id);
        setEditingTypeData({name: 'New Variant', options: []});
    };

    const handleEditVariantType = (card) => {
        setEditingTypeId(card.id);
        setEditingTypeData({name: card.name, options: [...card.options]});
    };

    const handleSaveVariantType = () => {
        if (!editingTypeData.name.trim()) return messageApi.warning('Name required');
        const newCards = variantTypeCards.map(c => c.id === editingTypeId ? {
            ...c, name: editingTypeData.name, options: editingTypeData.options
        } : c);
        setVariantTypeCards(newCards);
        syncVariants(newCards);
        setEditingTypeId(null);
    };

    const handleCancelEdit = () => {
        const card = variantTypeCards.find(c => c.id === editingTypeId);
        if (card && card.name === 'New Variant' && card.options.length === 0) {
            setVariantTypeCards(variantTypeCards.filter(c => c.id !== editingTypeId));
        }
        setEditingTypeId(null);
    };

    const handleDeleteVariantType = (cardId) => {
        const newCards = variantTypeCards.filter(c => c.id !== cardId);
        setVariantTypeCards(newCards);
        syncVariants(newCards);
    };

    const handleVariantChange = (variantId, field, value) => setVariants(prev => prev.map(v => v.id === variantId ? {
        ...v, [field]: value
    } : v));

    const handleVariantImageSelect = async (file, variantId) => {
        const preview = await getBase64(file);
        setVariants(prev => prev.map(v => v.id === variantId ? {
            ...v, imageFile: file, previewUrl: preview, isImageDeleted: false
        } : v));
        return false;
    };

    const handleRemoveVariantImage = (variantId) => setVariants(prev => prev.map(v => v.id === variantId ? {
        ...v, imageFile: null, previewUrl: null, images: [], isImageDeleted: true
    } : v));


    const fetchSellers = async () => {
        try {
            const res = await userService.getAllUsers({ role: 'SELLER', limit: 1000 });
            if (res?.data?.users) setSellers(res.data.users);
        } catch (e) {
            console.error("Fetch sellers error", e);
        }
    }

    const fetchGlobalStats = async () => {
        try {
            const response = await productService.getAllProducts({
                page: 1,
                limit: 10000
            });

            const allProducts = response?.data?.products || [];

            let active = 0, low = 0, out = 0;
            allProducts.forEach(p => {
                const status = getStockStatus(p.stockQuantity);
                if (status === 'ACTIVE') active++;
                else if (status === 'LOW_STOCK') low++;
                else out++;
            });
            setStats({ total: allProducts.length, active, lowStock: low, outStock: out });
        }
        catch {
            console.error("Stats error");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAllCategories();
            if (res?.data?.categories) setCategories(res.data.categories);
            else if (res?.data) setCategories(res.data);
        } catch (e) {
            console.error("Categories error", e);
        }
    };

    const fetchProducts = async (q = '') => {
        setLoading(true);
        try {
            const response = await productService.getAllProducts({
                page: 1,
                limit: 1000,
                search: q
            });

            let productsList = [];
            if (response?.data) {
                productsList = response.data.products || [];
            }
            setData(productsList);

            console.log(productsList);
        } catch (e) {
            console.error("Fetch products error:", e);
            messageApi.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalStats();
        fetchCategories();
        fetchSellers();
        fetchProducts(searchText);
    }, [searchText]);

    useEffect(() => {
        let result = [...data];
        if (activeTab === 'active') result = result.filter(p => getStockStatus(p.stockQuantity) === 'ACTIVE');
        else if (activeTab === 'low_stock') result = result.filter(p => getStockStatus(p.stockQuantity) === 'LOW_STOCK');
        else if (activeTab === 'out_stock') result = result.filter(p => getStockStatus(p.stockQuantity) === 'OUT_STOCK');

        setFilteredData(result);

        setPagination(prev => ({
            ...prev,
            current: 1,
            total: result.length
        }));

    }, [data, activeTab]);

    const getStockStatus = (stock) => {
        if (stock === 0) return "OUT_STOCK";
        if (stock <= 20) return "LOW_STOCK";
        return "ACTIVE";
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    }
    const handleChange = ({fileList: newFileList}) => setFileList(newFileList);

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleAdd = () => {
        addForm.resetFields();
        setFileList([]);
        setVariantTypeCards([]);
        setVariants([]);
        setIsAddModalOpen(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Delete this product?",
            content: "Are you sure you want to delete this product?",
            okType: 'danger',
            onOk: async () => {
                try {
                    await productService.deleteProduct(id);
                    messageApi.success('Deleted Successfully!');
                    fetchProducts(searchText);
                    fetchGlobalStats();
                } catch {
                    messageApi.error("Delete failed");
                }
            }
        });
    };

    const handleEdit = async (record) => {
        setSelectedProduct(record);
        setFileList((record.images || []).map((url, i) => ({uid: -i, name: `img-${i}`, status: 'done', url})));

        form.setFieldsValue({
            name: record.name,
            categoryId: record.categoryId,
            price: record.price,
            stockQuantity: record.stockQuantity,
            description: record.description || "",
        });

        try {
            const response = await productVariantService.getVariantsByProductId(record.id);
            const dbVariants = response.data || [];

            if (dbVariants.length > 0) {
                const extractedOptions = {};
                dbVariants.forEach(v => {
                    const attrs = v.variantAttributes || v.attributes || {};
                    Object.entries(attrs).forEach(([key, val]) => {
                        if (!extractedOptions[key]) extractedOptions[key] = new Set();
                        extractedOptions[key].add(val);
                    });
                });

                const cards = Object.entries(extractedOptions).map(([name, set], idx) => ({
                    id: Date.now() + idx, name: name, options: Array.from(set)
                }));
                setVariantTypeCards(cards);

                const mappedVariants = dbVariants.map(v => ({
                    id: v.id,
                    attributes: v.variantAttributes || v.attributes,
                    quantity: v.quantity,
                    priceAdjustment: v.priceAdjustment || 0,
                    previewUrl: (v.images && v.images.length > 0) ? v.images[0] : null,
                    imageFile: null,
                    enabled: true,
                    isImageDeleted: false
                }));

                setVariants(generateVariantsFromCards(cards, mappedVariants));
            } else {
                setVariantTypeCards([]);
                setVariants([]);
            }
        } catch (e) {
            console.error(e);
            setVariants([]);
        }
        setIsEditModalOpen(true);
    };

    const prepareFormData = (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description || "");
        formData.append('price', values.price);
        formData.append('categoryId', values.categoryId);

        if (values.sellerId) {
            formData.append('sellerUserId', values.sellerId);
        }

        const activeVariants = variants.filter(v => v.enabled);
        const hasVariants = activeVariants.length > 0;
        const finalStock = hasVariants ? activeVariants.reduce((s, v) => s + (v.quantity || 0), 0) : (values.stockQuantity || 0);
        formData.append('stockQuantity', finalStock);

        fileList.forEach(f => {
            if (f.originFileObj) formData.append('images', f.originFileObj);
        });

        if (hasVariants) {
            const variantsData = activeVariants.map((v) => ({
                variantAttributes: v.attributes,
                quantity: v.quantity || 0,
                priceAdjustment: v.priceAdjustment || 0,
            }));
            formData.append('variants', JSON.stringify(variantsData));

            activeVariants.forEach((v, index) => {
                if (v.imageFile) {
                    formData.append(`variant_image_${index}`, v.imageFile);
                }
            });
        }

        return formData;
    };

    const submitAdd = async () => {
        setAddLoading(true);
        try {
            const values = await addForm.validateFields();
            const formData = prepareFormData(values);

            console.log(formData);
            await productService.createProduct(formData);
            messageApi.success("Created successfully!");
            setIsAddModalOpen(false);
            fetchProducts(searchText);
            fetchGlobalStats();
        } catch (e) {
            console.error(e);
            messageApi.error(e.response?.data?.message || "Creation failed");
        } finally {
            setAddLoading(false);
        }
    }

    const submitEdit = async () => {
        setEditLoading(true);
        try {
            const values = await form.validateFields();
            const activeVariants = variants.filter(v => v.enabled);

            const prodData = new FormData();
            prodData.append('name', values.name);
            prodData.append('description', values.description || "");
            prodData.append('price', values.price);
            prodData.append('categoryId', values.categoryId);

            const hasExistingVariants = selectedProduct?.variantTypes && selectedProduct.variantTypes.length > 0;
            if (!hasExistingVariants) {
                const totalStock = activeVariants.length > 0 ? activeVariants.reduce((s, v) => s + (v.quantity || 0), 0) : values.stockQuantity;
                prodData.append('stockQuantity', totalStock);
            }

            fileList.forEach(f => {
                if (f.originFileObj) prodData.append('images', f.originFileObj);
            });

            await productService.updateProduct(selectedProduct.id, prodData);

            const variantsToDelete = variants.filter(v => !v.enabled && v.id && !v.id.toString().startsWith('temp'));

            if (variantsToDelete.length > 0) {
                for (const v of variantsToDelete) {
                    await productVariantService.deleteVariant(v.id);
                }
            }

            if (variantTypeCards.length > 0) {
                for (const v of activeVariants) {
                    const vFormData = new FormData();
                    vFormData.append('quantity', v.quantity);
                    vFormData.append('priceAdjustment', v.priceAdjustment);
                    vFormData.append('variantAttributes', JSON.stringify(v.attributes));

                    if (v.imageFile) {
                        vFormData.append('images', v.imageFile);
                    }

                    if (v.isImageDeleted && !v.imageFile) {
                        vFormData.append('deleteImage', 'true');
                    }

                    if (v.id && !v.id.toString().startsWith('temp')) {
                        await productVariantService.updateVariant(v.id, vFormData);
                    } else {
                        await productVariantService.createVariant(selectedProduct.id, vFormData);
                    }
                }
            }

            messageApi.success("Updated successfully!");
            setIsEditModalOpen(false);
            fetchProducts(searchText);
            fetchGlobalStats();
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Update failed");
        } finally {
            setEditLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            title: "Product Info",
            width: 300,
            render: (_, record) => (
                <div className="product-cell">
                    <Image src={record.images?.[0] || "https://placehold.co/100"}
                           width={48}
                           height={48}
                           style={{borderRadius: 8, objectFit: 'cover'}}
                           preview={false}/>
                    <div className="product-info">
                        <span className="product-name">{record.name}</span>
                        <span className="product-cat">{categories.find(c => c.id === record.categoryId)?.name}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Category',
            dataIndex: ['Category', 'name'],
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Seller',
            key: 'seller',
            width: 250,
            render: (_, record) => (
                record.createdBy ?
                    <Space align={"center"}>
                        <UserOutlined/>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text style={{fontSize: 14}}>{record.Seller.email}</Text>
                        </div>
                    </Space>
                    : <Text type="secondary">System/Admin</Text>
            )
        },
        {
            title: "Price",
            dataIndex: "price",
            render: (p) => <div style={{fontWeight: 600}}>{new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(p)}</div>
        },
        {
            title: "Stock",
            dataIndex: "stockQuantity",
            render: (s) => <Tag color={s <= 0 ? 'red' : s <= 20 ? 'orange' : 'green'}>{s} In Stock</Tag>
        },
        {
            title: "Status",
            render: (_, r) => {
                if (getStockStatus(r.stockQuantity) === 'ACTIVE') return <Badge status="success" text="Active"/>
                else if (getStockStatus(r.stockQuantity) === 'LOW_STOCK') return <Badge status="warning"
                                                                                        text="Low Stock"/>
                else if (getStockStatus(r.stockQuantity) === 'OUT_STOCK') return <Badge status="error"
                                                                                        text="Out Stock"/>
            }
        },
        {
            title: "Action",
            width: 150,
            render: (_, record) => (
                <div className="action-buttons">
                    <Tooltip title="View">
                        <Button size="small"
                                style={{borderColor: '#008ECC'}}
                                icon={<EyeOutlined style={{color: '#13c2c2'}}/>}
                                onClick={() => {
                                    setSelectedProduct(record);
                                    setViewModalOpen(true);
                                }}/>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button size="small"
                                style={{borderColor: '#faad14'}}
                                icon={<EditOutlined
                                    style={{color: '#faad14'}}/>}
                                onClick={() => handleEdit(record)}/>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button size="small"
                                danger
                                icon={<DeleteOutlined/>}
                                onClick={() => handleDelete(record.id)}/>
                    </Tooltip>
                </div>
            ),
        }], [categories]);

    const renderProductFormContent = (formInstance, isEdit = false) => {
        const totalVariantStock = variants.filter(v => v.enabled).reduce((sum, v) => sum + (v.quantity || 0), 0);
        const hasVariants = variants.length > 0;
        const collapseItems = [
            {
                key: 'basic',
                label: 'Basic Information',
                children: (
                    <div className="section-content">
                        <Form.Item name="name" label="Product Name" rules={[{required: true}]}>
                            <Input size="large"/>
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="categoryId"
                                           label="Category"
                                           rules={[{required: true}]}>
                                    <Select size="large">
                                        {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                {!isEdit && (
                                    <Form.Item
                                        name="sellerId"
                                        label="Assign Seller"
                                        rules={[{required: true, message: "Please select a seller"}]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="Select a seller"
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {sellers.map(s => (
                                                <Option key={s.id} value={s.id}>
                                                    {s.username} ({s.email})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                )}
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="stockQuantity"
                                           label={hasVariants ? `Total Stock (Calc: ${totalVariantStock})` : "Stock Quantity"}>
                                    <InputNumber style={{width: '100%'}} min={0} size="large" disabled={hasVariants}/>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="price"
                                           label="Price"
                                           rules={[{required: true}]}>
                                    <InputNumber style={{width: '100%'}}
                                                 min={0}
                                                 size="large"
                                                 formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                 parser={v => v.replace(/\$\s?|(,*)/g, '')}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                )
            },
            {
                key: 'description',
                label: 'Description',
                children: (
                    <div className="section-content">
                        <Form.Item name="description" noStyle>
                            <DescriptionEditor placeholder="Enter details..."/>
                        </Form.Item>
                    </div>
                )
            },
            {
                key: 'images',
                label: `Images (${fileList.length})`,
                children: (
                    <div className="upload-section">
                        <Alert title="First image will be the cover." type="info" showIcon style={{marginBottom: 10}}/>
                        <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview}
                                onChange={handleChange} beforeUpload={() => false} maxCount={5} multiple accept="image/*">
                            {fileList.length >= 5 ? null : <div><PlusOutlined/>
                                <div style={{marginTop: 8}}>Upload</div>
                            </div>}
                        </Upload>
                    </div>
                )
            },
            {
                key: 'variants',
                label: `Variants (${variants.filter(v => v.enabled).length})`,
                children: (
                    <div className="variant-section-content">
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
                            <Text strong>Types (e.g. Size, Color)</Text>
                            <Button size="small"
                                    type="dashed"
                                    icon={<PlusOutlined/>}
                                    onClick={handleAddVariantType}
                                    disabled={editingTypeId !== null}>
                                Add Type
                            </Button>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16}}>
                            {variantTypeCards.map(card => (
                                <Card key={card.id} size="small" Style={{padding: '12px'}}>
                                    <Row gutter={16} align="middle">
                                        <Col span={6}>
                                            {editingTypeId === card.id ?
                                                (
                                                    <Input value={editingTypeData.name}
                                                           onChange={e => setEditingTypeData({
                                                               ...editingTypeData,
                                                               name: e.target.value})} size="small"/>
                                                ) :
                                                <Text strong>{card.name}</Text>
                                            }
                                        </Col>

                                        <Col span={14}>
                                            {editingTypeId === card.id ?
                                                (
                                                    <Select mode="tags" style={{width: '100%'}}
                                                            size="small"
                                                            value={editingTypeData.options}
                                                            onChange={v => setEditingTypeData({...editingTypeData, options: v})}
                                                            tokenSeparators={[',']}/>
                                                ) :
                                                (
                                                    <Space size={[0, 4]} wrap>
                                                        {card.options.map(o => <Tag key={o}>{o}</Tag>)}
                                                    </Space>
                                                )
                                            }
                                        </Col>

                                        <Col span={4} style={{textAlign: 'right'}}>
                                            {editingTypeId === card.id ?
                                                (
                                                    <Space size={2}>
                                                        <Button type="primary"
                                                                size="small"
                                                                icon={<CheckOutlined/>}
                                                                onClick={handleSaveVariantType}/>
                                                        <Button size="small" icon={<CloseOutlined/>} onClick={handleCancelEdit}/>
                                                    </Space>
                                                ) :
                                                (
                                                    <Space size={2}>
                                                        <Button size="small"
                                                                icon={<EditOutlined/>}
                                                                onClick={() => handleEditVariantType(card)}/>
                                                        <Button size="small"
                                                                danger
                                                                icon={<DeleteOutlined/>}
                                                                onClick={() => handleDeleteVariantType(card.id)}/>
                                                    </Space>
                                                )
                                            }
                                        </Col>
                                    </Row>
                                </Card>))
                            }
                        </div>
                        {variants.length > 0 && (
                            <>
                                <Divider style={{margin: '12px 0'}}/>

                                <Table dataSource={variants} rowKey="id" pagination={false} size="small"
                                       scroll={{y: 250}}
                                       columns={[{
                                           title: 'Use',
                                           width: 50,
                                           align: 'center',
                                           render: (_, r) => (
                                               <Switch size="small"
                                                       checked={r.enabled}
                                                       onChange={v => handleVariantChange(r.id, 'enabled', v)}/>
                                           )
                                       },
                                           {
                                               title: 'Variant',
                                               render: (_, r) => (
                                                   <Space wrap>
                                                       {Object.entries(r.attributes).map(([k, v]) => <Tag key={k} color="blue">{v}</Tag>)}
                                                   </Space>
                                               )
                                           },
                                           {
                                               title: 'Price',
                                               width: 110,
                                               render: (_, r) => (
                                                   <InputNumber disabled={!r.enabled}
                                                                size="small"
                                                                value={r.priceAdjustment}
                                                                onChange={v => handleVariantChange(r.id, 'priceAdjustment', v)}
                                                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={v => v.replace(/\$\s?|(,*)/g, '')}/>
                                               )
                                           },
                                           {
                                               title: 'Qty',
                                               width: 110,
                                               render: (_, r) => (
                                                   <InputNumber disabled={!r.enabled} size="small" min={0}
                                                                value={r.quantity}
                                                                onChange={v => handleVariantChange(r.id, 'quantity', v)}/>
                                               )
                                           },
                                           {
                                               title: 'Img',
                                               width: 70,
                                               align: 'center',
                                               render: (_, r) => (
                                                   <div className={r.previewUrl ? "variant-img-wrapper" : ""}>
                                                       {r.previewUrl ?
                                                           (
                                                               <>
                                                                   <Image src={r.previewUrl} width={40} height={40}
                                                                          preview={{src: r.previewUrl}}
                                                                          style={{objectFit: 'cover'}}/>
                                                                   {r.enabled && <div className="remove-img-btn" onClick={(e) => {
                                                                       e.stopPropagation();
                                                                       handleRemoveVariantImage(r.id);
                                                                   }}>
                                                                       <CloseOutlined style={{fontSize: 10}}/>
                                                                   </div>}
                                                               </>
                                                           ) :
                                                           (
                                                               <Upload
                                                                   showUploadList={false}
                                                                   beforeUpload={(f) => handleVariantImageSelect(f, r.id)}
                                                                   disabled={!r.enabled}
                                                                   accept="image/*">
                                                                   <Button size="small" icon={<CameraOutlined/>}
                                                                           disabled={!r.enabled}
                                                                           style={{fontSize: 14, width: 24, height: 24, padding: 0}}/>
                                                               </Upload>
                                                           )
                                                       }
                                                   </div>
                                               )
                                           }]}
                                />
                            </>
                        )}
                    </div>
                )
            }];

        return <Collapse items={collapseItems} activeKey={activeCollapseKeys} onChange={setActiveCollapseKeys}/>;
    };

    const tabItems = [
        {
            key: 'all',
            label: <span><ShopOutlined /> All Products</span>
        },
        {
            key: 'active',
            label: <span><CheckCircleOutlined /> Active</span>
        },
        {
            key: 'low_stock',
            label: <span><WarningOutlined /> Low Stock</span>
        },
        {
            key: 'out_stock',
            label: <span><InboxOutlined /> Out of Stock</span>
        },
    ];

    return (<>
        {contextHolder}
        <div className="products-page">

            <div className="page-header">
                <div>
                    <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: 700}}>Product Management</Title>
                </div>
                <Button type="primary"
                        icon={<PlusOutlined/>}
                        style={{backgroundColor: '#008ECC'}}
                        onClick={handleAdd}>
                    Add Product
                </Button>
            </div>

            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon"><ShopOutlined/></div>
                    <div>
                        <div className="stat-label">Total</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                </div>
                <div className="stat-card active">
                    <div className="stat-icon"><CheckCircleOutlined/></div>
                    <div>
                        <div className="stat-label">Active</div>
                        <div className="stat-value">{stats.active}</div>
                    </div>
                </div>
                <div className="stat-card low-stock">
                    <div className="stat-icon"><WarningOutlined/></div>
                    <div>
                        <div className="stat-label">Low Stock</div>
                        <div className="stat-value">{stats.lowStock}</div>
                    </div>
                </div>
                <div className="stat-card out-stock">
                    <div className="stat-icon"><InboxOutlined/></div>
                    <div>
                        <div className="stat-label">Out Stock</div>
                        <div className="stat-value">{stats.outStock}</div>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems}/>

                <div className="table-actions">
                    <Input placeholder="Search..."
                           prefix={<SearchOutlined style={{color: '#ccc'}}/>}
                           style={{width: 350}}
                           onChange={(e) => setSearchText(e.target.value)}
                           allowClear/>
                </div>
                <Table columns={columns}
                       dataSource={filteredData}
                       rowKey="id"
                       loading={loading}
                       onChange={handleTableChange}
                       pagination={{
                           current: pagination.current,
                           pageSize: pagination.pageSize,
                           total: pagination.total,
                       }}
                />
            </div>
        </div>

        <Modal title="Add New Product (Admin)"
               open={isAddModalOpen}
               onOk={submitAdd}
               onCancel={() => setIsAddModalOpen(false)} confirmLoading={addLoading}
               okText="Create"
               centered
               width={900}
               style={{top: 20}}>

            <Form form={addForm} layout="vertical">{renderProductFormContent(addForm, false)}</Form>
        </Modal>

        <Modal title="Edit Product"
               open={isEditModalOpen}
               onOk={submitEdit}
               onCancel={() => setIsEditModalOpen(false)}
               confirmLoading={editLoading}
               okText="Save Changes"
               centered
               width={900}
               style={{top: 20}}>

            <Form form={form} layout="vertical">{renderProductFormContent(form, true)}</Form>
        </Modal>

        <Modal open={previewOpen}
               title={previewTitle}
               footer={null}
               onCancel={() => setPreviewOpen(false)}>

            <img alt="example" style={{width: '100%'}} src={previewImage}/>
        </Modal>

        <Modal open={viewModalOpen}
               onCancel={() => setViewModalOpen(false)}
               footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
               width={600}
               centered
               title="Product Details">
            {selectedProduct && (
                <div className="view-modal-content">
                    <div className="product-header-center">
                        <Image width={150}
                               src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : "https://placehold.co/200x200"}
                               className="product-detail-img"/>

                        <h3>{selectedProduct.name}</h3>

                        <div className="product-price-tag">{new Intl.NumberFormat('vi-VN', {
                            style: 'currency', currency: 'VND'
                        }).format(selectedProduct.price)}</div>

                        <Tag color="cyan" style={{marginTop: 8}}>
                            {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Category'}
                        </Tag>

                        {/* Display Seller in View Modal */}
                        {selectedProduct.CreatedBy && (
                            <div style={{marginTop: 8}}>
                                <Tag icon={<UserOutlined />} color="purple">
                                    Seller: {selectedProduct.CreatedBy.username}
                                </Tag>
                            </div>
                        )}
                    </div>

                    <div className="info-list">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed #eee',
                            padding: '10px 0'
                        }}>
                            <span style={{color: '#888'}}>Create At:</span>
                            <span
                                style={{fontWeight: 600}}>{dayjs(selectedProduct.createdAt).format('DD/MM/YYYY')}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed #eee',
                            padding: '10px 0'
                        }}>
                            <span style={{color: '#888'}}>Stock:</span>
                            <span style={{fontWeight: 600}}>{selectedProduct.stockQuantity}</span>
                        </div>

                        <div style={{marginTop: 15}}>
                            <span style={{color: '#888', display: 'block', marginBottom: 5}}>Description:</span>

                            <div style={{
                                background: '#fff',
                                padding: '16px',
                                borderRadius: 8,
                                fontSize: 13,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                border: '1px solid #d9d9d9'
                            }}>

                                <DescriptionRenderer description={selectedProduct.description}/>
                            </div>
                        </div>
                    </div>
                </div>)}
        </Modal>
    </>);
};

export default Products;