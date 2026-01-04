import React from "react";
import { Button, Typography, Row, Col } from "antd";
import ProductGrid from "./ProductGrid";
import "./ProductSection.css";
import { Link } from "react-router";

const { Title } = Typography;

const ProductSection = ({title, products, bannerImage, onViewAll, categoryId }) => {
    const hasBanner = !!bannerImage;

    return (
        <div className="product-section">
            <div className="section-header">
                <Title level={4}>{title}</Title>
                <Link to={`/category/${categoryId}`}>
                    <Button type="link" onClick={onViewAll}>
                        Xem tất cả
                    </Button>
                </Link>
            </div>

            <Row gutter={[16, 16]}>
                {hasBanner && (
                    <Col xs={24} md={6}>
                        <div className="banner-box">
                        <img src={bannerImage} alt="banner" />
                        </div>
                    </Col>
                )}

                <Col xs={24} md={hasBanner ? 18 : 24}>
                    <ProductGrid products={products} from={0} end={10} />
                </Col>
            </Row>
        </div>
    );
};

export default ProductSection;
