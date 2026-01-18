import React, {useState} from 'react'
import { useSearchParams } from 'react-router'
import { useEffect } from 'react'
import productService from '../../../services/productService'
import {Flex, Typography, Pagination, Layout, Spin, Row, Col, Empty} from 'antd'
import { FrownOutlined } from '@ant-design/icons'
import ProductFilters from "../../../components/ProductFilters/ProductFilters.jsx";
import ProductCard from "../../../components/Product/ProductCard.jsx";

const { Sider, Content } = Layout;

const SearchProduct = () => {
    const [searchParam] = useSearchParams();
    const key = searchParam.get('key');
    const [productsByName, setProductsByName] = React.useState([])
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    const handleFilterChange = (key, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    useEffect(() => {
        const fetchAllProductsByName = async () => {
            setLoading(true);
            try {
                const response = await productService.getAllProducts({
                    search: key,
                    ...filters
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
    }, [key, filters])

    const renderEmptyState = () => {
        if (Object.keys(filters).length > 0) {
            return <Empty description="No products found matching these filters." />;
        }
        return <NoProductsFound />;
    };

    return (
        <Layout style={{ background: 'transparent' }}>
            <Sider width={300} style={{ background: 'transparent', paddingRight: '24px', marginTop: '24px' }}>
                <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
            </Sider>

            <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px', marginTop: '24px' }}>
                <Spin spinning={loading}>
                    {productsByName.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {productsByName.map(product => (
                                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        !loading && renderEmptyState()
                    )}
                </Spin>
            </Content>
        </Layout>
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
