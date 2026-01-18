import React, { useEffect } from 'react'
import productService from '../../../services/productService'
import ProductGrid from '../../../components/Product/ProductGrid'
import { Pagination } from 'antd'

const AllProducts = () => {

    const [allProducts, setAllProducts] = React.useState([])
    const [currentPage, setCurrentPage] = React.useState(1)

    const fetchAllProducts = async () => {
        const products = await productService.getAllProducts()
        // Duplicate products with unique keys for testing
        // const duplicated = products.data.products.flatMap((p, index) => 
        //     Array(5).fill(null).map((_, i) => ({ ...p, id: `${p.id}-${i}` }))
        // )
        setAllProducts(products.data.products)
    }

    useEffect(() => {
        fetchAllProducts()
    }, [])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div>
            <ProductGrid products={allProducts} from={(currentPage - 1) * 24} end={currentPage * 24} />
            <Pagination 
                style={{marginTop: '16px'}} 
                current={currentPage} 
                total={allProducts.length} 
                pageSize={24} 
                onChange={handlePageChange} />
        </div>
    )
}

export default AllProducts
