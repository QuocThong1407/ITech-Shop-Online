import React, { useState } from "react"
import { Button, notification, Modal, Select, Radio, Space, Typography, Divider } from "antd"
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import cartService from "../../../../services/cartService"
import orderService from "../../../../services/orderService"
import './ActionButtons.css'

const ActionButtons = ({ selectedProductVariant, amount, productData, isAuthenticated }) => {
    const [loading, setLoading] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [buyNowLoading, setBuyNowLoading] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const { user } = useSelector(state => state.authReducer || { user: {} })
    const navigate = useNavigate()

    // Debug logging
    // console.log("ActionButtons props:", { selectedProductVariant, amount, productData })
    // console.log("selectedProductVariant:", selectedProductVariant)
    // console.log("selectedProductVariant quantity:", selectedProductVariant?.quantity)

    // Check if product has variants
    const hasVariants = productData?.variantTypes?.length > 0

    // For products without variants, use the first (default) product variant
    // Handle both PascalCase (from Supabase) and camelCase
    const productVariants = productData?.ProductVariant || productData?.productVariants || []
    const defaultVariant = !hasVariants && productVariants[0] ? productVariants[0] : null

    // effectiveVariant is the selected variant, or default variant for no-variant products
    const effectiveVariant = selectedProductVariant || defaultVariant

    // console.log("hasVariants:", hasVariants)
    // console.log("defaultVariant:", defaultVariant)
    // console.log("effectiveVariant:", effectiveVariant)

    const isVariantRequired = hasVariants && !selectedProductVariant
    const isOutOfStock = effectiveVariant && effectiveVariant.quantity <= 0

    // console.log("isVariantRequired:", isVariantRequired)
    // console.log("isOutOfStock:", isOutOfStock)

    const handleAddToCart = async () => {
        // Validation checks
        if (!isAuthenticated) {
            notification.warning({
                message: "Login Required",
                description: "Please login to add products to cart",
                placement: "topRight"
            })
            return
        }

        if (isVariantRequired) {
            notification.warning({
                message: "Variant Not Selected",
                description: "Please select a product variant before adding to cart",
                placement: "topRight"
            })
            return
        }

        if (amount <= 0) {
            notification.warning({
                message: "Invalid Quantity",
                description: "Quantity must be greater than 0",
                placement: "topRight"
            })
            return
        }

        // Check stock availability
        if (effectiveVariant.quantity < amount) {
            notification.warning({
                message: "Insufficient Stock",
                description: `Only ${effectiveVariant.quantity} items available in stock`,
                placement: "topRight"
            })
            return
        }

        try {
            setLoading(true)

            // Add item to cart - use variant ID
            // The backend automatically handles cart creation
            const variantId = effectiveVariant?.id
            if (!variantId) {
                throw new Error("Product variant not found. Please refresh the page and try again.")
            }
            // console.log("Adding to cart - variantId:", variantId, "quantity:", amount)
            
            await cartService.addToCart({
                productVariantId: variantId,
                quantity: amount
            })

            // Show success notification with View Cart button
            notification.success({
                message: "Added to Cart Successfully",
                description: `Added ${amount} ${productData.name} to cart`,
                btn: (
                    <Button type="link" size="small" onClick={() => navigate('/cart')}>
                        View Cart
                    </Button>
                ),
                placement: "topRight"
            })

            // Show visual feedback on button
            setAddedToCart(true)
            setTimeout(() => {
                setAddedToCart(false)
            }, 1500)

        } catch (error) {
            console.error("Error adding to cart:", error)
            notification.error({
                message: "Error",
                description: error.message || "An error occurred while adding product to cart",
                placement: "topRight"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            notification.warning({
                message: "Login Required",
                description: "Please login to purchase products",
                placement: "topRight"
            })
            return
        }

        if (isVariantRequired) {
            notification.warning({
                message: "Variant Not Selected",
                description: "Please select a product variant",
                placement: "topRight"
            })
            return
        }

        if (amount <= 0) {
            notification.warning({
                message: "Invalid Quantity",
                description: "Quantity must be greater than 0",
                placement: "topRight"
            })
            return
        }

        if (effectiveVariant.quantity < amount) {
            notification.warning({
                message: "Insufficient Stock",
                description: `Only ${effectiveVariant.quantity} items available in stock`,
                placement: "topRight"
            })
            return
        }

        // Check if user has addresses
        if (!user.customer?.addresses || user.customer.addresses.length === 0) {
            notification.warning({
                message: "No Address Found",
                description: "Please add a delivery address first",
                placement: "topRight"
            })
            return
        }

        // Show address selection modal
        setSelectedAddress(user.customer.addresses[0].id) // Pre-select first address
        setShowAddressModal(true)
    }

    const handleConfirmBuyNow = async () => {
        if (!selectedAddress) {
            notification.warning({
                message: "Address Not Selected",
                description: "Please select a delivery address",
                placement: "topRight"
            })
            return
        }

        try {
            setBuyNowLoading(true)
            const variantId = effectiveVariant.id || selectedProductVariant?.id

            const response = await orderService.createDirectOrder(selectedAddress, variantId, amount, paymentMethod)

            // Check if Stripe session URL exists
            if (response?.data?.stripeSessionUrl) {
                notification.success({
                    message: "Redirecting to Payment",
                    description: "Redirecting to Stripe checkout...",
                    placement: "topRight"
                })
                window.location.href = response.data.stripeSessionUrl
                return
            }

            notification.success({
                message: "Order Created Successfully",
                description: `Your order for ${amount} ${productData.name} has been placed`,
                placement: "topRight"
            })

            // Close modal and navigate to orders page
            setShowAddressModal(false)
            navigate('/orders/' + response.data.id)

        } catch (error) {
            console.error("Error creating order:", error)
            notification.error({
                message: "Error",
                description: error.message || "An error occurred while creating the order",
                placement: "topRight"
            })
        } finally {
            setBuyNowLoading(false)
        }
    }

    return (
        <>
            <div className="info__actions">
                <Button
                    icon={addedToCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
                    type="default"
                    size="large"
                    className={`action__add-cart ${addedToCart ? 'action__add-cart--success' : ''}`}
                    onClick={handleAddToCart}
                    loading={loading}
                    disabled={isVariantRequired || isOutOfStock || loading}
                    title={
                        isVariantRequired
                            ? "Please select a product variant"
                            : isOutOfStock
                                ? "Product out of stock"
                                : loading
                                    ? "Processing..."
                                    : addedToCart
                                        ? "Added to cart!"
                                        : "Add to cart"
                    }
                >
                    {addedToCart
                        ? "Added!"
                        : isVariantRequired
                            ? "Select Variant"
                            : isOutOfStock
                                ? "Out of Stock"
                                : "Add to Cart"
                    }
                </Button>
                <Button
                    type="primary"
                    size="large"
                    className="action__buy-now"
                    onClick={handleBuyNow}
                    disabled={isVariantRequired || isOutOfStock}
                    title={
                        isVariantRequired
                            ? "Please select a product variant"
                            : isOutOfStock
                                ? "Product out of stock"
                                : "Buy now"
                    }
                >
                    {isVariantRequired
                        ? "Select Variant"
                        : isOutOfStock
                            ? "Out of Stock"
                            : "Buy Now"
                    }
                </Button>
            </div>

            <Modal
                title="Checkout"
                open={showAddressModal}
                onOk={handleConfirmBuyNow}
                onCancel={() => setShowAddressModal(false)}
                confirmLoading={buyNowLoading}
                okText="Place Order"
                cancelText="Cancel"
                width={500}
            >
                <div style={{ marginBottom: 16 }}>
                    <Typography.Text strong>Delivery Address:</Typography.Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Select address"
                        value={selectedAddress}
                        onChange={setSelectedAddress}
                    >
                        {user.customer?.addresses?.map(address => (
                            <Select.Option key={address.id} value={address.id}>
                                {address.phoneNumber} {address.address}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <Divider />

                <div style={{ marginBottom: 16 }}>
                    <Typography.Text strong>Payment Method:</Typography.Text>
                    <Radio.Group
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ marginTop: 8, display: 'block' }}
                    >
                        <Space direction="vertical">
                            <Radio value="COD">Cash on Delivery (COD)</Radio>
                            <Radio value="VNPAY" disabled>VNPay <Typography.Text type="secondary">(in maintenance)</Typography.Text></Radio>
                            <Radio value="STRIPE">Stripe (Credit/Debit Card)</Radio>
                        </Space>
                    </Radio.Group>
                </div>

                <Divider />

                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    <Typography.Text strong>Order Summary:</Typography.Text>
                    <p style={{ margin: '8px 0 0 0' }}>
                        {productData.name} × {amount}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#ff4d4f', fontWeight: 'bold' }}>
                        Total: ${((productData.price + (effectiveVariant?.priceAdjustment || 0)) * amount).toFixed(2)}
                    </p>
                </div>
            </Modal>
        </>
    )
}

export default ActionButtons
