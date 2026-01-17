import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Skeleton, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import addressService from '../../../services/addressService';

const Address = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await addressService.getAddresses();
            if (res && res.data && res.data.addresses) {
                setAddresses(res.data.addresses);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton active />;
    }

    return (
        <div className="address-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: "32px", color: '#008ECC', margin: 0 }}>My Address</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => navigate('/profile/my-address/new')}
                    style={{ backgroundColor: "#008ECC" }}
                >
                    New Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <Empty description="No addresses found" />
            ) : (
                <Row gutter={[16, 16]}>
                    {addresses.map(addr => (
                        <Col span={24} key={addr.id}>
                            <Card
                                hoverable
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<EditOutlined />}
                                        onClick={() => navigate(`/profile/my-address/edit/${addr.id}`)}
                                    >
                                        Edit
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    avatar={<HomeOutlined style={{ fontSize: '24px', color: '#008ECC' }} />}
                                    title={addr.street || addr.address}
                                    description={
                                        <div>
                                            <p style={{ margin: 0 }}><strong>Address:</strong> {addr.address}</p>
                                            <p style={{ margin: 0 }}><strong>Street:</strong> {addr.street}</p>
                                            <p style={{ margin: 0 }}>{`${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                                            <p style={{ margin: '8px 0 0 0' }}><strong>Phone:</strong> {addr.phoneNumber}</p>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Address;