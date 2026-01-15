import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import { get } from "../../../utils/request.js";
import { Card, Col, Empty, Layout, Menu, Row, Spin } from "antd";
import ProductCard from "../../../components/Product/ProductCard.jsx";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
// import ProductFilters from "../../../components/ProductFilters/ProductFilters.jsx";
// import productService from "../../../services/productService.js";

const { Sider, Content } = Layout;


const FilteredProducts = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    const categories = useSelector(state => state.categories.allCategories);

    const handleFilterChange = (key, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    console.log(filters);

    useEffect(() => {
        if (categories.length > 0 && categoryId) {
            const found = categories.find(c => c.id === categoryId);
            setCurrentCategory(found);
        }
    }, [categoryId, categories]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!categoryId) return;
            setLoading(true);
            try {
                // Use getAllProducts which supports categoryId, search, and all sorting/filtering
                const response = await productService.getAllProducts({
                    categoryId,
                    ...filters
                });
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error getting filtered products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [categoryId, filters]);

    const breadcrumbItems = [];
    if (currentCategory) {
        breadcrumbItems.push({ title: currentCategory.name });
    }

    return (
        <>
            <BreadscrumbMenu items={breadcrumbItems} />

            <Layout style={{ background: 'transparent' }}>
                <Sider width={300} style={{ background: 'transparent', paddingRight: '24px', marginTop: '24px' }}>
                    <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                </Sider>

                <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px', marginTop: '24px' }}>
                    <Spin spinning={loading}>
                        {products.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {products.map(product => (
                                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            !loading && <Empty description="No products found." />
                        )}
                    </Spin>
                </Content>
            </Layout>
        </>
    )
}

export default FilteredProducts;