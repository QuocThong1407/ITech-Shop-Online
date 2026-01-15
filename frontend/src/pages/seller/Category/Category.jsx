import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
    Button,
    Card,
    Col,
    Input,
    message,
    Modal,
    Row,
    Space,
    Table,
    Typography,
    Image,
} from 'antd'
import {
    DeleteOutlined,
    ExportOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import categoryService from '../../../services/categoryService.js'
// import ActionButtons from '../../../components/common/ActionButtons/ActionButtons.jsx'
// import TablePagination from '../../../components/common/TablePagination/TablePagination.jsx'

const { Text } = Typography

const Category = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState([])
    const [searchText, setSearchText] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    })

    const [isForceModalOpen, setIsForceModalOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState(null)

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const response = await categoryService.getAllCategories()
            if (response && response.data) {
                const data = Array.isArray(response.data) ? response.data : response.data.categories || []
                setCategories(data)
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            message.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

  const handleDelete = async (id, force = false) => {
    console.log(`[handleDelete] id: ${id}, force: ${force}`)
    try {
        const result = await categoryService.deleteCategory(id, force)
        console.log('[handleDelete] Success:', result)
        message.success('Category deleted successfully')
        fetchCategories()
        setIsForceModalOpen(false)
    } catch (error) {
        console.error('[handleDelete] Error:', error)

        const statusCode = error.status
        const messageFromError = error.message || ''
        const lowerMessage = messageFromError.toLowerCase()

        // If it's a 400 or message includes product warning, show the force modal
        const isExistingProductsError =
            (statusCode == 400) ||
            lowerMessage.includes('existing products') ||
            lowerMessage.includes('cannot delete category')

        if (isExistingProductsError && !force) {
            console.log('[handleDelete] Showing force delete modal')
            setPendingDeleteId(id)
            setIsForceModalOpen(true)
        } else {
            message.error(messageFromError || 'Failed to delete category')
        }
    }
  }

    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one category')
            return
        }

        try {
            await Promise.all(
                selectedRowKeys.map(categoryId =>
                categoryService.deleteCategory(categoryId, false)
                )
            )
            message.success(`${selectedRowKeys.length} categor(ies) deleted successfully`)
            setSelectedRowKeys([])
            fetchCategories()
        } catch (error) {
            console.error('Error bulk deleting categories:', error)
            message.error('Failed to delete some categories')
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])


    const handleCategoryClick = (categoryName) => {
        navigate('/seller/products', { state: { searchCategory: categoryName } })
    }

    const columns = [
        {
            title: 'Category',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {record.image && (
                        <Image
                            src={record.image}
                            alt={text}
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                    )}
                    <div>
                        <div 
                            style={{ fontWeight: 500, cursor: 'pointer' }}
                            onClick={() => handleCategoryClick(text)}
                        >
                            {text}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Number of Products',
            dataIndex: 'productCount',
            key: 'productCount',
            render: (_, record) => <div style={{ fontWeight: 500 }}>{record.products.length}</div>,
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <ActionButtons
                    onEdit={() => navigate(`/seller/categories/${record.id}`)}
                    onDelete={() => handleDelete(record.id)}
                    deleteConfirmTitle="Delete Category"
                    deleteConfirmDesc="Are you sure you want to delete this category?"
                />
            ),
        },
    ]

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchText.toLowerCase())
    )

    const paginatedCategories = filteredCategories.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    )

    const handlePaginationChange = (page, pageSize) => {
        setPagination({ current: page, pageSize })
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys)
        },
    }

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
        <Col>
          <h2>Categories</h2>
        </Col>
        <Col>
          <Space>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#008ECC' }}
              onClick={() => navigate('/seller/categories/new')}
            >
              Add Category
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Space style={{ marginBottom: '16px', width: '100%' }} direction="vertical">
          <Input
            placeholder="Search by category name or description..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              setPagination({ ...pagination, current: 1 }) // Reset to page 1 on search
            }}
            allowClear
          />

          {selectedRowKeys.length > 0 && (
            <Space>
              <Text>Selected {selectedRowKeys.length} categor(ies)</Text>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
              >
                Clear Selection
              </Button>
            </Space>
          )}
        </Space>

        <Table
          columns={columns}
          dataSource={paginatedCategories}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 1200, y: 'calc(100vh - 380px)' }}
        />

        <TablePagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={filteredCategories.length}
          onChange={handlePaginationChange}
        />
      </Card>

      {/* Force Delete Confirmation Modal */}
      <Modal
        title="Category has existing products"
        open={isForceModalOpen}
        onOk={() => handleDelete(pendingDeleteId, true)}
        onCancel={() => setIsForceModalOpen(false)}
        okText="Yes, delete everything"
        cancelText="No, cancel"
        okButtonProps={{ danger: true }}
        maskClosable={false}
      >
        <p>This category contains products. Are you sure you want to delete this category and <b>ALL</b> its products?</p>
        <p style={{ color: '#ff4d4f' }}>This action cannot be undone.</p>
      </Modal>
    </>
  )
}

export default Category