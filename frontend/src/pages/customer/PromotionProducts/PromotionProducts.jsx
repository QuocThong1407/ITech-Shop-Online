import {useEffect, useState} from "react";
import {useParams} from "react-router";
import promotionService from "../../../services/promotionService.js";
import productService from "../../../services/productService.js";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import {Col, Empty, Layout, Row, Spin, Typography, Image} from "antd";
import ProductCard from "../../../components/Product/ProductCard.jsx";
import dayjs from 'dayjs';
import {ClockCircleOutlined, FireOutlined} from "@ant-design/icons";
import "./PromotionProducts.css"

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PromotionProducts = () => {
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [promotion, setPromotion] = useState({});

    useEffect( () => {
        const fetchPromotionAndProducts = async () => {
            setLoading(true);
            try {
                const promoRes = await promotionService.getPromotionById(id);
                console.log("Promotion data:", promoRes);

                const promoData = promoRes.data?.promotion || promoRes.data || {};
                setPromotion(promoData);
                console.log("Fetched promotion data:", promoData);

                let fetchedProducts = [];

                if (promoData) {
                    const promises = [];

                    // Check for both appliedCategories (correct field) and categories (legacy)
                    const categories = promoData.appliedCategories || promoData.categories || [];
                    if (categories.length > 0) {
                        categories.forEach(cat => {
                            promises.push(
                                productService.getAllProducts({categoryId: cat.id})
                                    .then(res => res.data?.products || [])
                                    .catch(err => [])
                            );
                        });
                    }

                    // Check for both appliedProducts (correct field) and products (legacy)
                    const appliedProducts = promoData.appliedProducts || promoData.products || [];
                    if (appliedProducts.length > 0) {
                        appliedProducts.forEach(prod => {
                            promises.push(
                                productService.getProductById(prod.id)
                                    .then(res => res.data ? [res.data] : [])
                                    .catch(err => [])
                            );
                        });
                    }

                    if (promises.length > 0) {
                        const results = await Promise.all(promises);
                        results.forEach(arr => {
                            fetchedProducts = [...fetchedProducts, ...arr];
                        });
                    }
                }

                const uniqueProducts = fetchedProducts.filter((product, index, self) =>
                    index === self.findIndex((p) => p.id === product.id)
                );

                setProducts(uniqueProducts);
            }
            catch (error) {
                console.error("Error fetching promotion data:", error);
                setProducts([]);
            }
            finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPromotionAndProducts();
        }
    }, [id]);

    const breadcrumbItems = [
        { title: promotion.name}
    ];

    const getDaysLeft = (endDate) => {
        const end = dayjs(endDate);
        const now = dayjs();
        const diff = end.diff(now, 'day');
        return diff > 0 ? diff : 0;
    };

    return (
        <>
            <BreadscrumbMenu items={breadcrumbItems} />

            {promotion && (
                <div className="promo-hero-container">
                    <div
                        className="promo-hero-bg"
                        style={{ backgroundImage: `url(${promotion.image})` }}
                    />

                    <div className="promo-hero-overlay" />

                    <div className="promo-hero-content">
                        <div className="promo-tag">
                            <FireOutlined /> Special Promotion
                        </div>

                        <Title className="promo-title">
                            {promotion.name}
                        </Title>

                        {promotion.description && (
                            <div className="promo-desc">
                                {promotion.description}
                            </div>
                        )}

                        <div className="promo-timer">
                            <div className="timer-item">
                                <ClockCircleOutlined style={{ fontSize: '24px', color: '#008ECC' }} />
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }}></div>

                            <div className="timer-item">
                                <span className="timer-value">{getDaysLeft(promotion.endDate)}</span>
                                <span className="timer-label">Days Left</span>
                            </div>

                            <div className="timer-item">
                                <span className="timer-value">{dayjs(promotion.endDate).format('DD')}</span>
                                <span className="timer-label">End Date</span>
                            </div>

                            <div className="timer-item">
                                <span className="timer-value">{dayjs(promotion.endDate).format('MMM')}</span>
                                <span className="timer-label">Month</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Layout style={{ background: 'transparent' }}>
                <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px', marginTop: '24px' }}>
                    <Spin spinning={loading}>
                        {products.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {products.map(product => (
                                    <Col key={product.id} xs={12} sm={12} md={8} lg={6} xl={{ flex: '20%' }} xxl={4}>
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            !loading && <Empty description="No products found for this promotion." />
                        )}
                    </Spin>
                </Content>
            </Layout>
        </>
    )
}

export default PromotionProducts;
