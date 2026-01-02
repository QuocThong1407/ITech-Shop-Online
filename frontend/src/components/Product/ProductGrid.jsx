import React from "react";
import { Row, Col } from "antd";
import ProductCard from "./ProductCard";
import { Link } from "react-router"; // Note: 'react-router-dom' is commonly used for web

const ProductGrid = ({ products, from=0, end=products.length }) => {
    return (
        <Row gutter={[16, 16]}>
            {products.slice(from, end).map((p) => (
                <Col 
                    key={p.id} 
                    xs={12}
                    sm={8}
                    md={6}
                    lg={{ flex: '20%' }}
                    xl={{ flex: '20%' }}
                    xxl={3}
                    style={{ height: "100%" }} 
                >
                    <Link 
                        to={`/products/${p.id}`} 
                        className="product-link" 
                    >
                        <ProductCard product={p} />
                    </Link>
                </Col>
            ))}
        </Row>
    );
};

export default ProductGrid;