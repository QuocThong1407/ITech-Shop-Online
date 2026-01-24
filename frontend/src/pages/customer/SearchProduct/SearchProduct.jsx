import React, {useState, useMemo} from 'react'
import { useSearchParams, Link } from 'react-router'
import { useEffect } from 'react'
import productService from '../../../services/productService'
import {Flex, Typography, Pagination, Layout, Spin, Row, Col, Empty, Grid} from 'antd'
import { FrownOutlined } from '@ant-design/icons'
import ProductFilters from "../../../components/ProductFilters/ProductFilters.jsx";
import ProductCard from "../../../components/Product/ProductCard.jsx";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const SearchProduct = () => {
    const [searchParam] = useSearchParams();
    const key = searchParam.get('key');
    const [productsByName, setProductsByName] = React.useState([])
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    
    const screens = useBreakpoint();
    const isMobile = !screens.sm;

    const handleFilterChange = (filterKey, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterKey]: value,
        }));
    };

    useEffect(() => {
        const fetchAllProductsByName = async () => {
            setLoading(true);
            try {
                // Only pass backend-supported filters
                const { minPrice, maxPrice } = filters;
                const response = await productService.getAllProducts({
                    search: key,
                    minPrice,
                    maxPrice,
                    limit: 100 // Get more products for client-side filtering
                })

                if (response?.data?.products) {
                    setProductsByName(response.data.products);
                } else {
                    setProductsByName([]);
                }
            }
            catch (error) {
                console.error("Error searching products:", error);
                setProductsByName([]);
            }
            finally {
                setLoading(false);
            }
        }
        fetchAllProductsByName()
    }, [key, filters.minPrice, filters.maxPrice])

    // Client-side filtering and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...productsByName];

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
    }, [productsByName, filters.minRating, filters.sortBy, filters.sortOrder]);

    const renderEmptyState = () => {
        if (Object.keys(filters).length > 0) {
            return <Empty description="No products found matching these filters." />;
        }
        return <NoProductsFound />;
    };

    return (
        <>
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
                            !loading && renderEmptyState()
                        )}
                    </Spin>
                </Content>
            </Layout>
        </>
    )
}

export default SearchProduct

const NoProductsFound = () => {
    return (
        <Flex vertical justify='center' align='center'>
            <FrownOutlined style={{color: 'red', fontSize: '24px'}}/>
            <Typography.Title level={3} style={{margin: '16px 0'}}>Sorry no results were found matching the keyword</Typography.Title>
            <Typography.Paragraph>
                <Typography.Text strong>Please try different keywords or remove filters to broaden your search</Typography.Text>
                <ul>
                    <li>Check your spelling</li>
                    <li>Try different or more general keywords</li>
                    <li>Try fewer keywords</li>
                </ul>
            </Typography.Paragraph>
        </Flex>
    )
}
