import React, { useEffect, useState } from 'react'
import productService from '../../../services/productService'
import ProductGrid from '../../../components/Product/ProductGrid'
import { Pagination, Spin, Empty, Card } from 'antd'

const AllProducts = () => {
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        total: 0,
        pageSize: 24,
        current: 1
    })

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await productService.getAllProducts({
                    page: currentPage,
                    limit: 24
                })
                
                if (response?.data?.products) {
                    setAllProducts(response.data.products)
                    setPagination({
                        total: response.data.pagination?.total || response.data.products.length,
                        pageSize: 24,
                        current: currentPage
                    })
                } else {
                    setAllProducts([])
                }
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Failed to load products. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchAllProducts()
    }, [currentPage])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading products..." />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty 
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        )
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <ProductGrid 
                    products={allProducts}
                    showHeader={true}
                    title="All Products"
                />
                {pagination.total > pagination.pageSize && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                        <Pagination 
                            current={pagination.current}
                            total={pagination.total}
                            pageSize={pagination.pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showTotal={(total) => `Total ${total} products`}
                        />
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AllProducts
