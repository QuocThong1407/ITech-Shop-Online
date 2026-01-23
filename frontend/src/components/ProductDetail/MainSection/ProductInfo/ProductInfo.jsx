import React from "react"
import { Button, Rate, Typography, Alert } from "antd"
import { ShoppingCartOutlined, LoginOutlined } from "@ant-design/icons"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import VariantSelector from "../VariantSelector/VariantSelector"
import QuantitySelector from "../QuantitySelector/QuantitySelector"
import ActionButtons from "../ActionButtons/ActionButtons"
import './ProductInfo.css'

const { Title, Text } = Typography

const ProductInfo = ({
    productData,
    selectedProductVariant,
    selectedAttributes,
    setSelectedAttributes,
    amount,
    setAmount
}) => {
    const { isAuthenticated } = useSelector(state => state.authReducer || { isAuthenticated: false })
    const navigate = useNavigate()

    // Format price to VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const basePrice = productData.price || 0
    const adjustment = selectedProductVariant?.priceAdjustment || 0
    const finalPrice = basePrice + adjustment

    // Calculate the highest discount percentage from all active promotions/coupons
    // Checks both direct product promotions AND category-based promotions
    const getMaxDiscountPercentage = () => {
        const now = new Date();
        let maxDiscount = 0;

        const checkPromotions = (promotions) => {
            if (!promotions || promotions.length === 0) return;

            promotions.forEach(promotion => {
                const isActive = promotion.status === 'ACTIVE';
                const isInDateRange = new Date(promotion.startDate) <= now && new Date(promotion.endDate) >= now;

                if (isActive && isInDateRange && promotion.coupons) {
                    promotion.coupons.forEach(coupon => {
                        if (coupon.discountPercentage > maxDiscount && coupon.usageCount < coupon.maxUsage) {
                            maxDiscount = coupon.discountPercentage;
                        }
                    });
                }
            });
        };

        // Check direct product promotions
        checkPromotions(productData.promotions);

        // Check category-based promotions (for all-store and category-wide vouchers)
        checkPromotions(productData.Category?.promotions);

        return Math.round(maxDiscount);
    };

    const discount = getMaxDiscountPercentage();
    const salePrice = finalPrice * (1 - discount / 100)

    // Determine stock quantity - use variant quantity if variant exists, otherwise calculate from all variants
    const stockQuantity = selectedProductVariant
        ? selectedProductVariant.quantity
        : productData.ProductVariant?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0

    const handleLoginRedirect = () => {
        navigate('/login')
    }

    return (
        <div className="product-detail__info">
            <Title level={3} className="info__name">
                {productData.name}
            </Title>

            <div className="info__meta">
                <div className="meta__rating">
                    <Rate allowHalf disabled value={productData.averageRating || 0} />
                    <Text type="secondary">({(productData.averageRating || 0).toFixed(1)}/5)</Text>
                </div>
                <span className="meta__divider">|</span>
                <Text type="secondary">{productData.reviewCount || 0} reviews</Text>
                <span className="meta__divider">|</span>
                <Text type="secondary">{productData.soldCount || 0} sold</Text>
            </div>

            <div className="info__price">
                <Text className="price--sale">{formatVND(salePrice)}</Text>
                {discount > 0 && (
                    <>
                        <Text className="price--original">{formatVND(finalPrice)}</Text>
                        <span className="price--discount">-{discount}%</span>
                    </>
                )}
            </div>

            {productData.variantTypes?.length > 0 && (
                <VariantSelector
                    variantTypes={productData.variantTypes}
                    variantOptions={productData.variantOptions}
                    productVariants={productData.ProductVariant}
                    selectedAttributes={selectedAttributes}
                    setSelectedAttributes={setSelectedAttributes}
                />
            )}

            {/* Stock Information */}
            <div className="info__stock">
                <Text strong>Stock: </Text>
                <Text type={stockQuantity > 0 ? "secondary" : "danger"}>
                    {stockQuantity > 0
                        ? `${stockQuantity} items available`
                        : 'Out of stock'}
                </Text>
            </div>

            {/* Conditional rendering based on authentication */}
            {!isAuthenticated ? (
                <div className="info__login-prompt">
                    <Alert
                        message="Sign in to purchase"
                        description="Please sign in to add items to cart or make a purchase."
                        type="info"
                        showIcon
                        style={{ marginBottom: 12 }}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={handleLoginRedirect}
                        block
                    >
                        Sign In to Purchase
                    </Button>
                </div>
            ) : (
                <>
                    <QuantitySelector amount={amount} setAmount={setAmount} stockQuantity={stockQuantity} />
                    <ActionButtons
                        selectedProductVariant={selectedProductVariant}
                        amount={amount}
                        productData={productData}
                        isAuthenticated={isAuthenticated}
                    />
                </>
            )}
        </div>
    )
}

export default ProductInfo
