import { Row, Col, Typography, Space, Button, Divider } from 'antd'
import { TwitterOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, PinterestOutlined } from '@ant-design/icons'
// import './Footer.css'

const { Title, Text, Paragraph, Link } = Typography

const Footer = () => {
    return (
        <div className="footer" style={{ padding: '48px 24px', backgroundColor: 'white' }}>
            <Row gutter={[32, 32]} style={{ width: '100%' }}>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            SWOO-1ST NYC TECH ONLINE MARKET
                        </Title>
                        <Space direction="vertical" size="small">
                            <Text type="secondary" strong>HOTLINE 24/7</Text>
                            <Title level={3} style={{ margin: 0, color: 'green' }}>(025) 3686 25 16</Title>
                        </Space>
                        <Paragraph style={{ margin: 0 }}>
                            257 Thatcher Road St, Brooklyn, Manhattan,<br />
                            NYC 10092
                        </Paragraph>
                        <Space size="middle">
                            <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
                                <Button 
                                    type="default" 
                                    shape="circle" 
                                    icon={<TwitterOutlined />} 
                                    className="media__icon twitter"
                                />
                            </a>
                            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                                <Button 
                                    type="default" 
                                    shape="circle" 
                                    icon={<FacebookOutlined />} 
                                    className="media__icon facebook"
                                />
                            </a>
                            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                                <Button 
                                    type="default" 
                                    shape="circle" 
                                    icon={<InstagramOutlined />} 
                                    className="media__icon instagram"
                                />
                            </a>
                            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer">
                                <Button 
                                    type="default" 
                                    shape="circle" 
                                    icon={<YoutubeOutlined />} 
                                    className="media__icon youtube"
                                />
                            </a>
                            <a href="https://pinterest.com/" target="_blank" rel="noopener noreferrer">
                                <Button 
                                    type="default" 
                                    shape="circle" 
                                    icon={<PinterestOutlined />} 
                                    className="media__icon pinterest"
                                />
                            </a>
                        </Space>
                    </Space>
                </Col>
                
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ margin: 0 }}>TOP CATEGORIES</Title>
                        <Space direction="vertical" size="small">
                            <Link>Laptops</Link>
                            <Link>PC & Computers</Link>
                            <Link>Cellphones</Link>
                            <Link>Tablets</Link>
                            <Link>Gaming & VR</Link>
                            <Link>Network</Link>
                            <Link>Cameras</Link>
                            <Link>Sounds</Link>
                        </Space>
                    </Space>
                </Col>
                
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ margin: 0 }}>COMPANY</Title>
                        <Space direction="vertical" size="small">
                            <Link>About Us</Link>
                            <Link>Careers</Link>
                            <Link>Our Stores</Link>
                            <Link>Our Cares</Link>
                            <Link>Terms & Conditions</Link>
                            <Link>Privacy Policy</Link>
                            <Link>Blog</Link>
                            <Link>Press</Link>
                        </Space>
                    </Space>
                </Col>
                
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ margin: 0 }}>HELP CENTER</Title>
                        <Space direction="vertical" size="small">
                            <Link>Customer Service</Link>
                            <Link>Track Your Order</Link>
                            <Link>Returns</Link>
                            <Link>Warranty</Link>
                            <Link>FAQ</Link>
                            <Link>Contact Us</Link>
                            <Link>Payment Methods</Link>
                            <Link>Shipping</Link>
                        </Space>
                    </Space>
                </Col>
                
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Title level={5} style={{ margin: 0 }}>PARTNER</Title>
                        <Space direction="vertical" size="small">
                            <Link>Become a Seller</Link>
                            <Link>Affiliate Program</Link>
                            <Link>Advertise</Link>
                            <Link>Partnerships</Link>
                            <Link>Suppliers</Link>
                            <Link>Wholesale</Link>
                            <Link>Corporate Sales</Link>
                            <Link>Developers</Link>
                        </Space>
                    </Space>
                </Col>
            </Row>
            
            <Divider />
            
            <Row justify="center">
                <Col>
                    <Text type="secondary">
                        © 2025 SWOO-1ST. All rights reserved.
                    </Text>
                </Col>
            </Row>
        </div>
    )
}

export default Footer