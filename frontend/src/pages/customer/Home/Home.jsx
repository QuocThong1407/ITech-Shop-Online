import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import CategoryListing from '../../../components/Category/CategoryListing'
import ProductSection from '../../../components/Product/ProductSection'
import PromotionFlag from '../../../components/PromotionFlag/PromotionFlag'
import { setProducts } from '../../../redux/actions/productAction.js'
import { useDispatch, useSelector } from 'react-redux'
import categoryService from '../../../services/categoryService.js'
import productService from '../../../services/productService.js'
import { Spin, Empty } from 'antd'

const Home = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [topCategories, setTopCategories] = useState([])

  const allProducts = useSelector(state => state.allProducts.products)
  const user = useSelector(state => state.authReducer.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else if (user?.role === 'SELLER') {
      navigate('/seller/products')
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch both products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAllProducts({ limit: 100 }),
          categoryService.getCategoryStats()
        ])

        // Set products first
        if (productsResponse?.data?.products) {
          dispatch(setProducts(productsResponse.data.products))
        }

        // Then set categories
        if (categoriesResponse?.data?.topCategories) {
          setTopCategories(categoriesResponse.data.topCategories)
        }

        setError(null)
      } catch {
        setError("Unable to load data.");
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dispatch])

  // Filter categories that actually have products to display
  const categoriesWithProducts = topCategories.filter(category => {
    const categoryProducts = allProducts.filter(p => p.categoryId === category.id)
    return categoryProducts.length > 0
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '50px' }}>
        <Empty description={error} />
      </div>
    )
  }

  return (
    <div>
      <CategoryListing />
      <PromotionFlag />
      {categoriesWithProducts.length > 0 ? (
        categoriesWithProducts.map(category => (
          <ProductSection
            key={category.id}
            title={category.name}
            products={allProducts.filter(p => p.categoryId === category.id)}
            categoryId={category.id}
          />  
        ))
      ) : (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Empty description="No products available" />
        </div>
      )}
    </div>
  )
}

export default Home