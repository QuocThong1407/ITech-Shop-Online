import React, { useEffect, useState, useCallback } from 'react';
import { List, Rate, Avatar, Typography, Spin, Empty, Pagination, Select, Space } from 'antd';
import productService from '../../../../services/productService';
import reviewService from '../../../../services/reviewService';
import { UserOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Option } = Select;

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });
    const [ratingFilter, setRatingFilter] = useState(null);

    const fetchReviews = useCallback(async (page = 1, limit = 5, rating = null) => {
        try {
            setLoading(true);
            const params = { page, limit };
            if (rating) {
                params.rating = rating;
            }
            const res = await reviewService.getProductReviews(productId, params);
            if (res && res.data) {
                setReviews(res.data.reviews || []);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    total: res.data.pagination?.total || res.data.reviews?.length || 0
                }));
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchReviews(1, pagination.pageSize, ratingFilter);
        }
    }, [productId, ratingFilter]);

    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
        fetchReviews(page, pageSize, ratingFilter);
    };

    const handleRatingFilterChange = (value) => {
        setRatingFilter(value || null);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    if (loading && reviews.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
    }

    return (
        <div className="product-reviews">
            {/* Filter Section */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Text strong>Filter by rating:</Text>
                    <Select
                        placeholder="All ratings"
                        allowClear
                        style={{ width: 150 }}
                        value={ratingFilter}
                        onChange={handleRatingFilterChange}
                    >
                        <Option value={5}>5 Stars</Option>
                        <Option value={4}>4 Stars</Option>
                        <Option value={3}>3 Stars</Option>
                        <Option value={2}>2 Stars</Option>
                        <Option value={1}>1 Star</Option>
                    </Select>
                </Space>
                <Text type="secondary">{pagination.total} review(s)</Text>
            </div>

            {reviews.length === 0 ? (
                <Empty description="No reviews yet for this product." />
            ) : (
                <>
                    <List
                        loading={loading}
                        itemLayout="horizontal"
                        dataSource={reviews}
                        renderItem={(review) => {
                            // Handle both PascalCase (from Supabase) and camelCase
                            const customer = review.customer;
                            const customerImage = customer?.image;
                            const username = customer?.user?.username || customer?.User?.username || 'Anonymous';
                            
                            return (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} src={customerImage} />}
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong>{username}</Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {new Date(review.reviewDate).toLocaleDateString()}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Rate disabled defaultValue={review.rating} style={{ fontSize: '12px', marginBottom: '8px' }} />
                                            <Paragraph>{review.comment}</Paragraph>
                                            {review.images && review.images.length > 0 && (
                                                <div className="review-images" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    {review.images.map((img, index) => (
                                                        <img
                                                            key={index}
                                                            src={img}
                                                            alt={`Review ${index}`}
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}}
                    />
                    
                    {/* Pagination */}
                    {pagination.total > pagination.pageSize && (
                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={handlePageChange}
                                showSizeChanger
                                pageSizeOptions={['5', '10', '20']}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} reviews`}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductReviews;
