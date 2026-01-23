import React, { useEffect, useState } from 'react';
import { Typography, Card, Progress, Row, Col, Spin, Empty, Tag } from 'antd';
import { CrownOutlined, TrophyOutlined, RocketOutlined } from '@ant-design/icons';
import membershipService from '../../../services/membershipService';
import './Membership.scss';
import { formatVND } from '../../../utils/converter';

const { Title, Text } = Typography;

const Membership = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembership();
    }, []);

    const fetchMembership = async () => {
        setLoading(true);
        try {
            const res = await membershipService.getMyMembership();
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch membership", error);
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'BRONZE': return '#cd7f32';
            case 'SILVER': return '#c0c0c0';
            case 'GOLD': return '#ffd700';
            default: return '#008ECC';
        }
    };

    const getTierIcon = (tier) => {
        switch (tier) {
            case 'BRONZE': return <RocketOutlined style={{ color: '#cd7f32' }} />;
            case 'SILVER': return <TrophyOutlined style={{ color: '#c0c0c0' }} />;
            case 'GOLD': return <CrownOutlined style={{ color: '#ffd700' }} />;
            default: return <CrownOutlined />;
        }
    };

    const getNextTierInfo = (spent) => {
        // Backend uses VND thresholds: SILVER >= 1,000,000 VND, GOLD >= 5,000,000 VND
        if (spent < 1000000) {
            return { next: 'SILVER', goal: 1000000, remaining: 1000000 - spent };
        }
        if (spent < 5000000) {
            return { next: 'GOLD', goal: 5000000, remaining: 5000000 - spent };
        }
        return { next: null, goal: 5000000, remaining: 0 };
    };

    if (loading) {
        return (
            <div className="membership-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!data || !data.membership) {
        return (
            <div className="membership-empty">
                <Empty description="No membership data found. Start shopping to earn rewards!" />
            </div>
        );
    }

    const { spent, membership } = data;
    const nextTier = getNextTierInfo(spent);
    const percent = nextTier.next ? Math.min(100, (spent / nextTier.goal) * 100) : 100;

    return (
        <div className="membership">
            <Title level={2} style={{ color: '#008ECC', marginBottom: '32px' }}>My Membership</Title>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card className="membership__card tier-card">
                        <div className="membership__tier-info">
                            <div className="membership__tier-icon">
                                {getTierIcon(membership)}
                            </div>
                            <div className="membership__tier-text">
                                <Text type="secondary">Current Tier</Text>
                                <Title level={3} style={{ margin: 0, color: getTierColor(membership) }}>{membership}</Title>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card className="membership__card">
                        <Title level={4}>Spending Progress</Title>
                        <div className="membership__spent">
                            <Text type="secondary">Total Spent: </Text>
                            <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>{formatVND(spent)}</Text>
                        </div>

                        <div className="membership__progress">
                            <Progress
                                percent={Math.round(percent)}
                                strokeColor={getTierColor(membership)}
                                status="active"
                            />
                            {nextTier.next && (
                                <div className="membership__next-tier">
                                    <Text type="secondary">
                                        Spend {formatVND(nextTier.remaining)} more to reach <Tag color={getTierColor(nextTier.next)}>{nextTier.next}</Tag>
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card className="membership__card">
                        <Title level={4}>Membership Benefits</Title>
                        <ul className="membership__benefits">
                            <li>Exclusive discounts for {membership} members</li>
                            <li>Priority customer support</li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Membership;
