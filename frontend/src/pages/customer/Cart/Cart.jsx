import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Checkbox,
    Button,
    Empty,
    message,
    Spin,
    List,
    InputNumber,
    Popconfirm,
    Modal,
    Radio,
    Space,
    Typography,
    Divider,
    Image,
    Select,
} from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, TagOutlined, GiftOutlined } from '@ant-design/icons';
import cartService from '../../../services/cartService';
import addressService from '../../../services/addressService';
import couponService from '../../../services/couponService';
import membershipService from '../../../services/membershipService';

const { Title, Text } = Typography;

const Cart = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.authReducer || { user: {}, isAuthenticated: false });
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [checkingOut, setCheckingOut] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);

    // Membership state
    const [membership, setMembership] = useState(null);

    // Membership discount percentages by tier
    const MEMBERSHIP_DISCOUNTS = {
        BRONZE: 0,
        SILVER: 5,
        GOLD: 10,
    };

    useEffect(() => {
        console.log('Cart - User:', user);
        console.log('Cart - isAuthenticated:', isAuthenticated);

        if (!isAuthenticated) {
            message.error('Please login to view your cart');
            navigate('/login');
            return;
        }

        if (!user?.customer?.id) {
            console.error('User customer ID not found:', user);
            message.error('Customer information not available');
            setLoading(false);
            return;
        }

        fetchCart();
        fetchMembership();
    }, [user, isAuthenticated, navigate]);

    const fetchMembership = async () => {
        try {
            const response = await membershipService.getMyMembership();
            if (response?.data?.membership) {
                setMembership(response.data.membership);
            }
        } catch (error) {
            console.error('Error fetching membership:', error);
        }
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            console.log('Fetching cart...');
            const response = await cartService.getMyCart();
            console.log('Cart response:', response);

            // Handle response structure: response.data contains cart with items
            if (response && response.data) {
                // Transform items to match expected UI structure (PascalCase to camelCase)
                const transformedItems = (response.data.items || []).map(item => ({
                    ...item,
                    productVariant: {
                        id: item.ProductVariant?.id,
                        quantity: item.ProductVariant?.quantity,
                        variantAttributes: item.ProductVariant?.variantAttributes,
                        images: item.ProductVariant?.images,
                        priceAdjustment: item.ProductVariant?.priceAdjustment || 0,
                        product: {
                            id: item.ProductVariant?.Product?.id,
                            name: item.ProductVariant?.Product?.name,
                            description: item.ProductVariant?.Product?.description,
                            price: item.ProductVariant?.Product?.price,
                            images: item.ProductVariant?.Product?.images,
                            stockQuantity: item.ProductVariant?.Product?.stockQuantity,
                            category: item.ProductVariant?.Product?.Category
                        }
                    }
                }));

                const cartData = {
                    ...response.data,
                    cartItems: transformedItems
                };
                setCart(cartData);
                console.log('Cart loaded:', cartData);
            } else {
                console.log('No cart found');
                setCart(null);
            }
        } catch (error) {
            message.error('Failed to load cart');
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            console.log('Fetching addresses...');
            const response = await addressService.getAddresses();
            console.log('Addresses response:', response);

            // Handle response structure
            const addressData = response?.data?.addresses || response?.addresses || [];
            if (addressData.length > 0) {
                setAddresses(addressData);
                setSelectedAddress(addressData[0].id);
                console.log('Addresses loaded:', addressData);
            } else {
                setAddresses([]);
                console.log('No addresses found');
            }
        } catch (error) {
            message.error('Failed to load addresses');
            console.error('Error fetching addresses:', error);
        }
    };

    const handleSelectItem = (itemId, checked) => {
        if (checked) {
            setSelectedItems([...selectedItems, itemId]);
        } else {
            setSelectedItems(selectedItems.filter((id) => id !== itemId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allItemIds = cart.cartItems.map((item) => item.id);
            setSelectedItems(allItemIds);
        } else {
            setSelectedItems([]);
        }
    };

    const handleUpdateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;
        try {
            console.log('Updating quantity:', { itemId, quantity });
            await cartService.updateCartItem(itemId, quantity);
            message.success('Quantity updated');
            fetchCart();
        } catch (error) {
            message.error('Failed to update quantity');
            console.error('Error updating quantity:', error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            console.log('Deleting cart item:', { itemId });
            await cartService.deleteCartItem(itemId);
            message.success('Item removed from cart');
            setSelectedItems(selectedItems.filter((id) => id !== itemId));
            fetchCart();
        } catch (error) {
            message.error('Failed to remove item');
            console.error('Error deleting item:', error);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.cartItems) return 0;
        const subtotal = cart.cartItems
            .filter((item) => selectedItems.includes(item.id))
            .reduce((total, item) => {
                const basePrice = item.productVariant.product.price;
                const finalPrice = basePrice + item.productVariant.priceAdjustment;
                return total + finalPrice * item.quantity;
            }, 0);
        return subtotal;
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return calculateTotal() * (appliedCoupon.discountPercentage / 100);
    };

    const calculateMembershipDiscount = () => {
        if (!membership) return 0;
        const discountPercent = MEMBERSHIP_DISCOUNTS[membership.membership] || 0;
        // Apply membership discount after coupon discount
        const afterCoupon = calculateTotal() - calculateDiscount();
        return afterCoupon * (discountPercent / 100);
    };

    const getMembershipDiscountPercent = () => {
        if (!membership) return 0;
        return MEMBERSHIP_DISCOUNTS[membership.membership] || 0;
    };

    const calculateFinalTotal = () => {
        return calculateTotal() - calculateDiscount() - calculateMembershipDiscount();
    };

    const fetchAvailableCoupons = async () => {
        if (selectedItems.length === 0) {
            setAvailableCoupons([]);
            return;
        }

        try {
            setCouponLoading(true);
            const productVariantIds = cart.cartItems
                .filter((item) => selectedItems.includes(item.id))
                .map((item) => item.productVariant.id);

            const response = await couponService.getAvailableCoupons(productVariantIds);
            setAvailableCoupons(response?.data?.coupons || []);
        } catch (error) {
            console.error('Error fetching available coupons:', error);
            setAvailableCoupons([]);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleApplyCoupon = async (code) => {
        if (!code) {
            message.warning('Please enter a coupon code');
            return;
        }

        try {
            setCouponLoading(true);
            const productVariantIds = cart.cartItems
                .filter((item) => selectedItems.includes(item.id))
                .map((item) => item.productVariant.id);

            const response = await couponService.validateCoupon(code, productVariantIds);

            if (response?.data?.valid) {
                setAppliedCoupon(response.data.coupon);
                message.success(`Coupon "${code}" applied! ${response.data.coupon.discountPercentage}% off`);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        message.info('Coupon removed');
    };

    // Fetch available coupons when selected items change
    useEffect(() => {
        if (cart && selectedItems.length > 0) {
            fetchAvailableCoupons();
        }
    }, [selectedItems]);

    const handleCheckoutClick = async () => {
        if (selectedItems.length === 0) {
            message.warning('Please select at least one item to checkout');
            return;
        }
        await fetchAddresses();
        setCheckoutModalVisible(true);
    };

    const handleCheckout = async () => {
        if (!selectedAddress) {
            message.warning('Please select a delivery address');
            return;
        }

        try {
            setCheckingOut(true);

            // Prepare discount info
            const discountInfo = {
                couponCode: appliedCoupon?.code || null,
                couponDiscount: calculateDiscount(),
                membershipDiscount: calculateMembershipDiscount(),
                membershipTier: membership?.membership || null,
            };

            console.log('Processing checkout:', {
                customerId: user.customer.id,
                selectedItems,
                selectedAddress,
                paymentMethod,
                discountInfo
            });

            const response = await cartService.checkout(
                user.customer.id,
                selectedItems,
                selectedAddress,
                paymentMethod,
                discountInfo
            );

            console.log('Checkout response:', response);

            if (response && (response.ok || response.data)) {
                const orderData = response.data?.order || response.data;

                // Check if Stripe session URL exists
                if (orderData?.stripeSessionUrl) {
                    message.success('Redirecting to Stripe checkout...');
                    // Redirect to Stripe checkout page
                    window.location.href = orderData.stripeSessionUrl;
                    return;
                }

                message.success('Order placed successfully!');
                setCheckoutModalVisible(false);
                setSelectedItems([]);
                fetchCart();
                navigate('/orders');
            } else {
                throw new Error('Checkout failed');
            }
        } catch (error) {
            message.error(error.message || 'Failed to checkout');
            console.error('Error during checkout:', error);
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Your cart is empty"
                >
                    <Button type="primary" onClick={() => navigate('/products')}>
                        Start Shopping
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card>
                <Checkbox
                    checked={selectedItems.length === cart.cartItems.length}
                    indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < cart.cartItems.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ marginBottom: '16px' }}
                >
                    Select All ({cart.cartItems.length} items)
                </Checkbox>

                <List
                    dataSource={cart.cartItems}
                    renderItem={(item) => {
                        const basePrice = item.productVariant.product.price;
                        const finalPrice = basePrice + item.productVariant.priceAdjustment;

                        return (
                            <List.Item
                                key={item.id}
                                style={{
                                    padding: '16px',
                                    border: '1px solid #f0f0f0',
                                    marginBottom: '8px',
                                    borderRadius: '4px',
                                }}
                            >
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                    <Checkbox
                                        checked={selectedItems.includes(item.id)}
                                        onChange={(e) =>
                                            handleSelectItem(item.id, e.target.checked)
                                        }
                                        style={{ marginRight: '16px' }}
                                    />

                                    <Image
                                        src={
                                            item.productVariant.images?.[0] ||
                                            item.productVariant.product.images?.[0] ||
                                            'https://via.placeholder.com/80'
                                        }
                                        alt={item.productVariant.product.name}
                                        width={80}
                                        height={80}
                                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                                    />

                                    <div style={{ flex: 1, marginLeft: '16px' }}>
                                        <Text strong>{item.productVariant.product.name}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {Object.entries(item.productVariant.variantAttributes).map(
                                                ([key, value]) => `${key}: ${value}`
                                            ).join(', ')}
                                        </Text>
                                        <br />
                                        <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                                            ${finalPrice.toFixed(2)}
                                        </Text>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <InputNumber
                                            min={1}
                                            max={item.productVariant.quantity}
                                            value={item.quantity}
                                            onChange={(value) =>
                                                handleUpdateQuantity(item.id, value)
                                            }
                                        />

                                        <Text strong style={{ minWidth: '80px', textAlign: 'right' }}>
                                            ${(finalPrice * item.quantity).toFixed(2)}
                                        </Text>

                                        <Popconfirm
                                            title="Remove this item?"
                                            onConfirm={() => handleDeleteItem(item.id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />

                <Divider />

                {/* Coupon Section */}
                <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <TagOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                        <Text strong>Coupons</Text>
                    </div>

                    {/* Applied Coupon */}
                    {appliedCoupon ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: 6,
                            marginBottom: 12
                        }}>
                            <div>
                                <Text strong style={{ color: '#52c41a' }}>
                                    <GiftOutlined /> {appliedCoupon.code}
                                </Text>
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    {appliedCoupon.discountPercentage}% off
                                </Text>
                            </div>
                            <Button type="link" danger size="small" onClick={handleRemoveCoupon}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        /* Coupon Input */
                        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                            <input
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '6px 0 0 6px',
                                    outline: 'none'
                                }}
                            />
                            <Button
                                type="primary"
                                onClick={() => handleApplyCoupon(couponCode)}
                                loading={couponLoading}
                                disabled={selectedItems.length === 0}
                            >
                                Apply
                            </Button>
                        </Space.Compact>
                    )}

                    {/* Available Coupons */}
                    {!appliedCoupon && (
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Available Coupons:</Text>
                            {couponLoading ? (
                                <Spin size="small" style={{ marginLeft: 8 }} />
                            ) : availableCoupons.length > 0 ? (
                                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {availableCoupons.map((coupon) => (
                                        <Button
                                            key={coupon.id}
                                            size="small"
                                            onClick={() => handleApplyCoupon(coupon.code)}
                                            style={{ borderStyle: 'dashed' }}
                                        >
                                            {coupon.code} ({coupon.discountPercentage}% off)
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <Text type="secondary" style={{ display: 'block', marginTop: 4, fontStyle: 'italic' }}>
                                    No coupons available for selected items
                                </Text>
                            )}
                        </div>
                    )}
                </Card>

                {/* Total Section */}
                <div style={{ textAlign: 'right' }}>
                    <Space direction="vertical" align="end">
                        <div>
                            <Text style={{ fontSize: '14px' }}>Subtotal ({selectedItems.length} items): </Text>
                            <Text style={{ fontSize: '14px' }}>${calculateTotal().toFixed(2)}</Text>
                        </div>
                        {appliedCoupon && (
                            <div>
                                <Text style={{ fontSize: '14px', color: '#52c41a' }}>
                                    Coupon Discount ({appliedCoupon.discountPercentage}%):
                                </Text>
                                <Text style={{ fontSize: '14px', color: '#52c41a' }}>
                                    -${calculateDiscount().toFixed(2)}
                                </Text>
                            </div>
                        )}
                        {membership && getMembershipDiscountPercent() > 0 && (
                            <div>
                                <Text style={{ fontSize: '14px', color: '#ffc107' }}>
                                    {membership.membership} Member Discount ({getMembershipDiscountPercent()}%):
                                </Text>
                                <Text style={{ fontSize: '14px', color: '#ffc107' }}>
                                    -${calculateMembershipDiscount().toFixed(2)}
                                </Text>
                            </div>
                        )}
                        <div>
                            <Text strong style={{ fontSize: '18px' }}>Total: </Text>
                            <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
                                ${calculateFinalTotal().toFixed(2)}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleCheckoutClick}
                            disabled={selectedItems.length === 0}
                        >
                            Proceed to Checkout
                        </Button>
                    </Space>
                </div>
            </Card>

            <Modal
                title="Checkout"
                open={checkoutModalVisible}
                onOk={handleCheckout}
                onCancel={() => setCheckoutModalVisible(false)}
                confirmLoading={checkingOut}
                okText="Place Order"
                width={600}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Title level={5}>Select Delivery Address</Title>
                    {addresses.length === 0 ? (
                        <Empty description="No addresses found">
                            <Button onClick={() => navigate('/profile/addresses')}>
                                Add Address
                            </Button>
                        </Empty>
                    ) : (
                        <Select
                            value={selectedAddress}
                            onChange={setSelectedAddress}
                            style={{ width: '100%' }}
                            placeholder="Select a delivery address"
                        >
                            {addresses.map((address) => (
                                <Select.Option key={address.id} value={address.id}>
                                    {address.recipientName} - {address.phone} - {address.street}, {address.ward}, {address.district}, {address.province}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </div>

                <Divider />

                <div style={{ marginBottom: '24px' }}>
                    <Title level={5}>Payment Method</Title>
                    <Radio.Group
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <Space direction="vertical">
                            <Radio value="COD">Cash on Delivery (COD)</Radio>
                            <Radio value="VNPAY" disabled>VNPay <Text type="secondary">(in maintenance)</Text></Radio>
                            <Radio value="STRIPE">Stripe</Radio>
                        </Space>
                    </Radio.Group>
                </div>

                <Divider />

                <div style={{ textAlign: 'right' }}>
                    <Space direction="vertical" align="end" size="small">
                        <div>
                            <Text style={{ fontSize: '14px' }}>Subtotal: </Text>
                            <Text style={{ fontSize: '14px' }}>${calculateTotal().toFixed(2)}</Text>
                        </div>
                        {appliedCoupon && (
                            <div>
                                <Text style={{ fontSize: '14px', color: '#52c41a' }}>
                                    Coupon ({appliedCoupon.discountPercentage}%): -${calculateDiscount().toFixed(2)}
                                </Text>
                            </div>
                        )}
                        {membership && getMembershipDiscountPercent() > 0 && (
                            <div>
                                <Text style={{ fontSize: '14px', color: '#ffc107' }}>
                                    {membership.membership} ({getMembershipDiscountPercent()}%): -${calculateMembershipDiscount().toFixed(2)}
                                </Text>
                            </div>
                        )}
                        <div>
                            <Text strong style={{ fontSize: '18px' }}>Total Amount: </Text>
                            <Text strong style={{ fontSize: '24px', color: '#ff4d4f' }}>
                                ${calculateFinalTotal().toFixed(2)}
                            </Text>
                        </div>
                    </Space>
                </div>
            </Modal>
        </div>
    );
};

export default Cart;
