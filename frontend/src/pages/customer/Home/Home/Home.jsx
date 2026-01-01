import React, { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import CategoryListing from '../../../components/Category/CategoryListing'
import ProductSection from '../../../components/Product/ProductSection'
import { setProducts } from '../../../redux/actions/productAction.js'
import { useDispatch, useSelector } from 'react-redux'
import { get } from '../../../utils/request'

const Home = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const allProducts = useSelector(state => state.allProducts.products)
  const allCategories = useSelector(state => state.allCategories.categories)
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
        const data = await get('/products')

        dispatch(setProducts(data.data.products))
        setError(null)
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError("Unable to load product data.");
      } finally {
        setIsLoading(false)
      }
    }
    getProducts()
  }, [])


  return (
    <div>
      <CategoryListing />
      {allCategories.slice(0, 3).map(category => (
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