import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Rate, Input, Button, List, Image, message, Spin, Divider, Upload, Modal } from 'antd';
import { ArrowLeftOutlined, StarFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import orderService from '../../../services/orderService';
import reviewService from '../../../services/reviewService';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const LeaveReview = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderById(orderId);
            setOrder(response.data?.order || response.order || response.data || response);
        } catch (error) {
            console.error('Error loading order:', error);
            message.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!order) return <div style={{ padding: '50px', textAlign: 'center' }}><Title level={4}>Order not found</Title></div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders')}
                style={{ marginBottom: '24px' }}
            >
                Back to Orders
            </Button>

            <div style={{ marginBottom: '32px' }}>
                <Title level={2} style={{ marginBottom: '8px' }}>Product Reviews</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Order ID: <Text code>{order.id}</Text>
                </Text>
            </div>

            <List
                dataSource={order.OrderItem || order.orderItems || []}
                renderItem={(item) => (
                    <ReviewItem
                        key={item.id}
                        item={item}
                        orderId={order.id}
                        onSuccess={fetchOrderDetails}
                    />
                )}
            />
        </div>
    );
};

const ReviewItem = ({ item, orderId, onSuccess }) => {
    const [rating, setRating] = useState(item.review?.rating || 0);
    const [comment, setComment] = useState(item.review?.comment || '');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(!item.review);
    const [fileList, setFileList] = useState(
        item.review?.images?.map((url, index) => ({
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done',
            url: url,
        })) || []
    );
    const hasExistingReview = !!item.review;

    // Extract actual file objects from fileList for upload
    const getImageFiles = () => {
        return fileList
            .filter(file => file.originFileObj) // Only new files that need to be uploaded
            .map(file => file.originFileObj);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            message.warning('Please provide a star rating');
            return;
        }

        try {
            setSubmitting(true);

            const imageFiles = getImageFiles();

            if (hasExistingReview) {
                // Update existing review
                await reviewService.updateReview(item.review.id, {
                    rating,
                    comment,
                    images: imageFiles,
                });
                message.success('Review updated successfully');
            } else {
                // Create new review
                await reviewService.createReview({
                    rating,
                    comment,
                    orderItemId: item.id,
                    images: imageFiles,
                });
                message.success('Review submitted successfully');
            }

            setIsEditing(false);
            onSuccess();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to submit review';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            hoverable={!hasExistingReview}
            style={{
                marginBottom: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: isEditing ? '1px solid #1890ff' : '1px solid #f0f0f0'
            }}
        >
            <Space align="start" size="large" style={{ width: '100%' }}>
                <div style={{ padding: '4px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <Image
                        src={item.ProductVariant?.images?.[0] || item.ProductVariant?.Product?.images?.[0] || item.productVariant?.images?.[0] || item.productVariant?.product?.images?.[0] || 'https://via.placeholder.com/100'}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                        preview={false}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Title level={4} style={{ margin: '0 0 4px 0' }}>
                                {item.ProductVariant?.Product?.name || item.productVariant?.product?.name || 'Product'}
                            </Title>
                            <Text type="secondary">
                                {(item.ProductVariant?.variantAttributes || item.productVariant?.variantAttributes) &&
                                    Object.entries(item.ProductVariant?.variantAttributes || item.productVariant?.variantAttributes)
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join(' | ')
                                }
                            </Text>
                        </div>
                        {hasExistingReview && !isEditing && (
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        )}
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {isEditing ? (
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Your Rating</Text>
                                <Rate value={rating} onChange={setRating} style={{ fontSize: '24px' }} />
                            </div>

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Your Feedback</Text>
                                <TextArea
                                    rows={4}
                                    placeholder="Tell us what you like or dislike about the product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={500}
                                    showCount
                                />
                            </div>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Images</Text>
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={async (file) => {
                                        let src = file.url;
                                        if (!src) {
                                            src = await new Promise((resolve) => {
                                                const reader = new FileReader();
                                                reader.readAsDataURL(file.originFileObj);
                                                reader.onload = () => resolve(reader.result);
                                            });
                                        }
                                        const imgWindow = window.open(src);
                                        imgWindow?.document.write(`<img src="${src}" />`);
                                    }}
                                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                                    beforeUpload={(file) => {
                                        // Validate file type
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('You can only upload image files!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        // Validate file size (max 5MB)
                                        const isLt5M = file.size / 1024 / 1024 < 5;
                                        if (!isLt5M) {
                                            message.error('Image must be smaller than 5MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        return false; // Prevent auto upload, we'll handle it on submit
                                    }}
                                >
                                    {fileList.length < 5 && (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </div>

                            <Space>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    loading={submitting}
                                    size="large"
                                    style={{ borderRadius: '6px', padding: '0 32px' }}
                                >
                                    {hasExistingReview ? 'Save Changes' : 'Submit Review'}
                                </Button>
                                {hasExistingReview && (
                                    <Button onClick={() => {
                                        setIsEditing(false);
                                        setRating(item.review.rating);
                                        setComment(item.review.comment);
                                        setFileList(item.review.images?.map((url, index) => ({
                                            uid: `-${index}`,
                                            name: `image-${index}`,
                                            status: 'done',
                                            url: url,
                                        })) || []);
                                    }}>
                                        Cancel
                                    </Button>
                                )}
                            </Space>
                        </Space>
                    ) : (
                        <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <Rate disabled value={rating} style={{ fontSize: '18px' }} />
                                <Text type="secondary" style={{ marginLeft: '12px' }}>
                                    Reviewed on {new Date(item.review.createdAt).toLocaleDateString('en-US')}
                                </Text>
                            </div>
                            <Text style={{ fontSize: '16px', fontStyle: 'italic', color: '#434343', display: 'block', marginBottom: '16px' }}>
                                "{comment || 'No comment provided.'}"
                            </Text>
                            {item.review?.images?.length > 0 && (
                                <Space size="small" wrap>
                                    {item.review.images.map((url, index) => (
                                        <Image
                                            key={index}
                                            src={url}
                                            width={80}
                                            height={80}
                                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    ))}
                                </Space>
                            )}
                        </div>
                    )}
                </div>
            </Space>
        </Card>
    );
};

export default LeaveReview;
