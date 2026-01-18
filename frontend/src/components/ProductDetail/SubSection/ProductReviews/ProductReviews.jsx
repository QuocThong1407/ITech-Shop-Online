import React, { useEffect, useState } from 'react';
import { List, Rate, Avatar, Typography, Spin, Empty } from 'antd';
import productService from '../../../../services/productService';
import { UserOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await productService.getProductReviews(productId);
                if (res && res.data && res.data.reviews) {
                    setReviews(res.data.reviews);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
    }

    if (reviews.length === 0) {
        return <Empty description="No reviews yet for this product." />;
    }

    return (
        <div className="product-reviews">
            <List
                itemLayout="horizontal"
                dataSource={reviews}
                renderItem={(review) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} src={review.customer?.image} />}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>{review.customer?.user?.username || 'Anonymous'}</Text>
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
                )}
            />
        </div>
    );
};

export default ProductReviews;
