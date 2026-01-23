import React from "react";
import { Card, Typography, Tag, Image, Flex } from "antd";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
    // Format price to VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Strip HTML tags from description
    // const stripHtml = (html) => {
    //     if (!html) return '';
    //     const doc = new DOMParser().parseFromString(html, 'text/html');
    //     return doc.body.textContent || '';
    // };
    
    // Get category name
    const categoryName = product.Category?.name || "Category";

    // Get the first image or use a placeholder
    const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder-product.png';

    return (
        <Card 
            hoverable 
            className="product-card"
            styles={{ body: { padding: 0 } }}
        >
            {/* Image Container */}
            <div className="product-image-container">
                <div className="product-image-wrapper">
                    <Image
                        alt={product.name}
                        src={productImage}
                        preview={false}
                        className="product-image"
                        fallback="/placeholder-product.png"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="product-content">
                {/* Category and Name */}
                <div className="product-header">
                    <div className="product-brand-name">
                        <Tag className="brand-tag">{categoryName}</Tag>
                        <Typography.Title 
                            level={5} 
                            className="product-name"
                            ellipsis={{ rows: 2, tooltip: product.name }}
                            title={product.name}
                        >
                            {product.name}
                        </Typography.Title>
                    </div>
                </div>

                {/* Description */}
                {/* <Typography.Paragraph 
                    className="product-description"
                    ellipsis={{ rows: 2, tooltip: cleanDescription }}
                >
                    {cleanDescription}
                </Typography.Paragraph> */}

                {/* Price and Seller */}
                <Flex justify="space-between" align="center" className="product-footer">
                    <Typography.Text className="product-price" strong type="danger">
                        {formatVND(product.price)}
                    </Typography.Text>
                    {/* <Tag color="default" className="category-tag">
                        {sellerName}
                    </Tag> */}
                </Flex>
            </div>
        </Card>
    );
};

export default ProductCard;