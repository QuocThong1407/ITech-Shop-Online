import { Link, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, Col, Empty, Layout, Menu, Row, Spin, Grid } from "antd";
import ProductCard from "../../../components/Product/ProductCard.jsx";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import ProductFilters from "../../../components/ProductFilters/ProductFilters.jsx";
import productService from "../../../services/productService.js";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;


const FilteredProducts = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    
    const screens = useBreakpoint();
    const isMobile = !screens.sm;

    const categories = useSelector(state => state.categories.allCategories);

    const handleFilterChange = (key, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value,
        }));
    };

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
                // Only pass backend-supported filters
                const { minPrice, maxPrice } = filters;
                const response = await productService.getAllProducts({
                    categoryId,
                    minPrice,
                    maxPrice,
                    limit: 100 // Get more products for client-side filtering
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
    }, [categoryId, filters.minPrice, filters.maxPrice]);

    // Client-side filtering and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by minimum rating (client-side)
        if (filters.minRating && filters.minRating > 0) {
            result = result.filter(p => (p.averageRating || 0) >= filters.minRating);
        }

        // Sort (client-side)
        const sortBy = filters.sortBy || 'name';
        const sortOrder = filters.sortOrder || 'asc';

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'price':
                    comparison = (a.price || 0) - (b.price || 0);
                    break;
                case 'rating':
                    comparison = (a.averageRating || 0) - (b.averageRating || 0);
                    break;
                case 'name':
                default:
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [products, filters.minRating, filters.sortBy, filters.sortOrder]);

    const breadcrumbItems = [];
    if (currentCategory) {
        breadcrumbItems.push({ title: currentCategory.name });
    }

    return (
        <>
            <BreadscrumbMenu items={breadcrumbItems} />

            {/* Mobile: Filter as dropdown above products */}
            {isMobile && (
                <div style={{ marginTop: '16px' }}>
                    <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                </div>
            )}

            <Layout style={{ background: 'transparent' }}>
                {/* Desktop: Filter as sidebar */}
                {!isMobile && (
                    <Sider width={300} style={{ background: 'transparent', paddingRight: '24px', marginTop: '24px' }}>
                        <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                    </Sider>
                )}

                <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px', marginTop: isMobile ? '0' : '24px' }}>
                    <Spin spinning={loading}>
                        {filteredAndSortedProducts.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {filteredAndSortedProducts.map(product => (
                                    <Col key={product.id} xs={12} sm={12} md={8} lg={6}>
                                        <Link to={`/product/${product.id}`}>
                                            <ProductCard product={product} />
                                        </Link>
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