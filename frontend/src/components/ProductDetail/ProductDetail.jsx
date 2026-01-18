import { useEffect, useState } from "react"
import { useParams } from 'react-router'
import productService from '../../services/productService.js'
import { Tabs, Typography, Row, Col, Flex } from "antd"
import ProductGallery from "./MainSection/ProductGallery/ProductGallery.jsx"
import ProductInfo from "./MainSection/ProductInfo/ProductInfo.jsx"
import "./ProductDetail.css"
import ProductDescriptionTemplate from "./SubSection/ProductDescriptionTemplate/ProductDescriptionTemplate"
import ProductReviews from "./SubSection/ProductReviews/ProductReviews.jsx"

const { Title } = Typography

const ProductDetail = () => {
    const { productId } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [productData, setProductData] = useState(null)
    const [selectedProductVariant, setSelectedProductVariant] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [amount, setAmount] = useState(1)

    const tabItems = [
        { key: '1', label: 'Description', children: <ProductDescriptionTemplate /> },
        { key: '2', label: 'Reviews', children: <ProductReviews productId={productId} /> }
    ]

    // --- Load sản phẩm ---
    useEffect(() => {
        setIsLoading(true)
        const fetchProductData = async () => {
            try {
                // const data = await get(`/products/${productId}`)
                const data = await productService.getProductById(productId)
                setProductData(data.data)

                // Don't auto-select variants - let user choose
                // Set initial image to first available
                setSelectedImage(data.data?.images?.[0] || null)
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu sản phẩm:", error)
                setProductData(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductData()
    }, [productId])

    useEffect(() => {
        if (!productData || !selectedAttributes) return

        // Helper to get attribute value case-insensitively
        const getAttrValue = (attrs, key) => {
            const lowerKey = key.toLowerCase()
            const foundKey = Object.keys(attrs || {}).find(k => k.toLowerCase() === lowerKey)
            return foundKey ? attrs[foundKey] : undefined
        }

        const matchedVariant = productData.productVariants?.find((v) =>
            Object.entries(selectedAttributes).every(
                ([key, val]) => getAttrValue(v.variantAttributes, key) === val
            )
        )

        setSelectedProductVariant(matchedVariant || null)

        // Use variant images if variant selected AND has images, otherwise use product images
        const variantImages = matchedVariant?.images?.length > 0 ? matchedVariant.images : null
        setSelectedImage(
            variantImages?.[0] || productData.images?.[0] || null
        )
    }, [selectedAttributes, productData])

    if (isLoading) return <div>Loading...</div>
    if (!productData) return <div>No product was found</div>

    return (
        <div className="product-detail">
            <Row gutter={[24, 0]}>
                <Col span={14}>
                    <Flex vertical gap={'16px'}>
                        <ProductGallery
                            images={
                                (selectedProductVariant?.images?.length > 0)
                                    ? selectedProductVariant.images
                                    : productData.images
                            }
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                        />

                        <div className="sub" style={{ background: 'white', borderRadius: '10px' }}>
                            <Tabs items={tabItems} style={{ padding: '0 20px' }} />
                        </div>
                    </Flex>
                </Col>

                <Col
                    span={10}
                    style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '16px',
                        alignSelf: 'flex-start'
                    }}
                >
                    <ProductInfo
                        productData={productData}
                        selectedProductVariant={selectedProductVariant}
                        selectedAttributes={selectedAttributes}
                        setSelectedAttributes={setSelectedAttributes}
                        amount={amount}
                        setAmount={setAmount}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ProductDetail
