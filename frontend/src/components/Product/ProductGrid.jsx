import React from "react";
import { Row, Col, Typography, Empty } from "antd";
import ProductCard from "./ProductCard";
import { Link } from "react-router";
import "./ProductGrid.css";

const { Title, Text } = Typography;

const ProductGrid = ({ 
    products, 
    from = 0, 
    end = products.length,
    title = "Products",
    showHeader = false,
    emptyMessage = "No items match your filters",
    emptyDescription = "Try adjusting your price range or selecting different categories"
}) => {
    const displayedProducts = products.slice(from, end);

    // Empty state
    if (displayedProducts.length === 0) {
        return (
            <div className="product-grid-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="empty-content">
                            <Title level={4} className="empty-title">{emptyMessage}</Title>
                            <Text type="secondary">{emptyDescription}</Text>
                        </div>
                    }
                />
            </div>
        );
    }

    return (
        <div className="product-grid-container">
            {showHeader && (
                <div className="product-grid-header">
                    <Title level={3} className="product-grid-title">{title}</Title>
                    <Text type="secondary">
                        Showing {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''}
                    </Text>
                </div>
            )}
            
            <Row gutter={[24, 24]}>
                {displayedProducts.map((p) => (
                    <Col 
                        key={p.id} 
                        xs={12}
                        sm={8}
                        md={4}
                        lg={4}
                        xl={4}
                        xxl={4}
                    >
                        <Link 
                            to={`/product/${p.id}`} 
                            className="product-link" 
                        >
                            <ProductCard product={p} />
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ProductGrid;