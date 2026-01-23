import React, { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import CategoryListing from '../../../components/Category/CategoryListing'
import ProductSection from '../../../components/Product/ProductSection'
import PromotionFlag from '../../../components/PromotionFlag/PromotionFlag'
import { setProducts } from '../../../redux/actions/productAction.js'
import { useDispatch, useSelector } from 'react-redux'
import { get } from '../../../utils/request'
import categoryService from '../../../services/categoryService.js'
import productService from '../../../services/productService.js'

const Home = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [topCategories, setTopCategories] = useState([])

  const allProducts = useSelector(state => state.allProducts.products)
  const allCategories = useSelector(state => state.categories.allCategories)
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
    const getProducts = async () => {
      try {
        setIsLoading(true)
        const data = await productService.getAllProducts({ limit: 100 })

        dispatch(setProducts(data.data.products))
        setError(null)
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError("Unable to load product data.");
      } finally {
        setIsLoading(false)
      }
    }
    
    const getTopCategories = async () => {
      try {
        setIsLoading(true)
        const data = await categoryService.getCategoryStats();
        setTopCategories(data.data.topCategories)
      } catch (error) {
        console.error("Lỗi khi tải danh mục hàng đầu:", error);
      }
    }

    getTopCategories()
    getProducts()
  }, [])


  return (
    <div>
      <CategoryListing />
      <PromotionFlag />
      {topCategories.map(category => (
        <ProductSection
          key={category.id}
          title={category.name}
          products={allProducts.filter(p => p.categoryId === category.id)}
          categoryId={category.id}
        />  
      ))}
      {/* <ProductSection
        title='test'
        products={allProducts}
      />
      <ProductSection
        title='Suggested: this should be best-selling products of the week/month'
        products={allProducts}
      />
      <ProductSection
        title='Suggested: this should be recommended products for the user'
        products={allProducts}
      /> */}
    </div>
  )
}

export default Home