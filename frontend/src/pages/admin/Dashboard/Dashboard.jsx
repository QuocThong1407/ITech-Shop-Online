import React, { useState, useEffect, useCallback } from "react";
import orderService from "../../../services/orderService";
import productService from "../../../services/productService";
import userService from "../../../services/userService";
import membershipService from "../../../services/membershipService";
import { Area, Pie } from '@ant-design/plots';
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Avatar,
    Space,
    Skeleton,
    Button,
    Table
} from "antd";
import {
    ShoppingOutlined,
    UserOutlined,
    DollarOutlined,
    AppstoreOutlined,
    ArrowRightOutlined,
    RiseOutlined,
    PieChartOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./Dashboard.css";

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        estimatedRevenue: 0
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);

    const [revenueChartData, setRevenueChartData] = useState([]);
    const [statusChartData, setStatusChartData] = useState([]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const extractData = (res, key) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data)) return res.data;
        if (res.data[key] && Array.isArray(res.data[key])) return res.data[key];
        return [];
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [productsRes, usersRes, ordersRes, topCustRes] = await Promise.all([
                productService.getAllProducts({ limit: 2000 }),
                userService.getAllUsers({ limit: 2000 }),
                orderService.getAllOrders({ limit: 2000 }),
                membershipService.getTopSpent()
            ]);

            const products = extractData(productsRes, 'products');
            const users = extractData(usersRes, 'users');
            const orders = extractData(ordersRes, 'orders');
            const topCust = extractData(topCustRes, 'members') || [];

            console.log(products);
            console.log(orders);
            console.log(topCust);
            console.log(users);


            let revenue = 0;
            const statusMap = { PENDING: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
            const revenueByDate = {};

            orders.forEach(order => {
                const amount = Number(order.Payment?.[0]?.amount || 0);
                const orderDate = dayjs(order.createdAt).format('YYYY-MM-DD');

                if (order.Payment?.[0]?.status === 'SUCCESS') {
                    revenue += amount;

                    if (revenueByDate[orderDate]) {
                        revenueByDate[orderDate] += amount;
                    }
                    else {
                        revenueByDate[orderDate] = amount;
                    }
                }

                const st = order.status ? order.status.toUpperCase() : 'OTHER';
                if (statusMap[st] !== undefined) {
                    statusMap[st]++;
                }
            });

            const revenueChart = Object.keys(revenueByDate)
                .map(date => ({ date, value: revenueByDate[date] }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            const statusChart = Object.keys(statusMap)
                .map(status => ({ type: status, value: statusMap[status] }))
                .filter(item => item.value > 0);


            const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const recent5Orders = sortedOrders.slice(0, 5);

            setStats({
                totalOrders: orders.length,
                totalProducts: products.length,
                totalUsers: users.length,
                estimatedRevenue: revenue
            });

            setRecentOrders(recent5Orders);
            setTopCustomers(topCust);
            setRevenueChartData(revenueChart);
            setStatusChartData(statusChart);

        } catch (error) {
            console.error("Dashboard data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const revenueConfig = {
        data: revenueChartData,
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#52c41a',
        areaStyle: {
            fill: 'l(270) 0:#ffffff 0.5:#d9f7be 1:#52c41a',
        },
        yAxis: {
            label: {
                formatter: (v) => `${(v / 1000000).toFixed(0)}M`,
            },
        },
        tooltip: {
            formatter: (datum) => {
                return { name: 'Revenue', value: formatCurrency(datum.value) };
            },
        },
        height: 300,
    };

    const pieConfig = {
        data: statusChartData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            text: (d) => `${d.type}\n ${d.value}`,
            position: 'spider',
        },
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },

        color: ({ type }) => {
            if(type === 'DELIVERED') return '#52c41a';
            if(type === 'CANCELLED') return '#ff4d4f';
            if(type === 'PENDING') return '#fa8c16';
            if(type === 'SHIPPED') return '#1890ff';
            return '#bfbfbf';
        },
        height: 300,
    };

    const recentOrderColumns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text code>#{id ? id.substring(0, 8).toUpperCase() : 'N/A'}</Text>,
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_, record) => (
                <Space>
                    <Avatar size="small" src={record.Customer?.User?.image} icon={<UserOutlined />} />
                    <Text>{record.Customer?.User?.username || "Guest"}</Text>
                </Space>
            ),
        },
        {
            title: 'Total',
            key: 'total',
            render: (_, record) => <Text strong>{formatCurrency(record.Payment?.[0]?.amount || 0)}</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                let color = 'default';
                const s = status ? status.toUpperCase() : '';
                if (s === 'PENDING') color = 'orange';
                else if (s === 'DELIVERED' || s === 'COMPLETED') color = 'green';
                else if (s === 'CANCELLED') color = 'red';
                else if (s === 'SHIPPED') color = 'blue';
                return <Tag color={color}>{s}</Tag>;
            }
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'right',
            render: (date) => dayjs(date).format('DD/MM'),
        }
    ];

    const topCustomerColumns = [
        {
            title: '#',
            width: 50,
            render: (_, __, index) => {
                const rank = index + 1;
                const color = rank === 1 ? '#fadb14' : rank === 2 ? '#d9d9d9' : rank === 3 ? '#cd7f32' : '#f0f0f0';
                return <Avatar size={22} style={{backgroundColor: color, color: '#333', fontSize: 12}}>{rank}</Avatar>
            }
        },
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <Text strong>{record.Customer?.User?.username || record.username || "User"}</Text>
                        <Text type="secondary" style={{fontSize: 11}}>{record.Customer?.User?.email || record.email}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Membership',
            dataIndex: 'membership',
            key: 'membership',
            align: 'center',
            render: (membership) => {
                const mem = membership ? membership.toUpperCase() : 'STANDARD';
                let color = 'default';
                if (mem === 'SILVER') color = 'blue';
                if (mem === 'GOLD') color = 'gold';
                if (mem === 'PLATINUM') color = '#2f54eb';
                if (mem === 'DIAMOND') color = 'cyan';

                return <Tag color={color}>{mem}</Tag>;
            }
        },
        {
            title: 'Spent',
            dataIndex: 'spent',
            key: 'spent',
            align: 'right',
            render: (val) => <Text strong style={{color: '#52c41a'}}>{formatCurrency(val || 0)}</Text>
        }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Dashboard Overview</Title>
                <Text className="dashboard-subtitle">Business performance and analytics.</Text>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card-widget">
                    <div className="stat-widget-icon green"><DollarOutlined /></div>

                    <div className="stat-widget-content">
                        <span className="stat-widget-label">Revenue</span>
                        <span className="stat-widget-value">{loading ? <Skeleton.Button active size="small" /> : formatCurrency(stats.estimatedRevenue)}</span>
                    </div>
                </div>
                <div className="stat-card-widget">
                    <div className="stat-widget-icon blue"><ShoppingOutlined /></div>

                    <div className="stat-widget-content">
                        <span className="stat-widget-label">Total Orders</span>
                        <span className="stat-widget-value">{loading ? <Skeleton.Button active size="small" /> : stats.totalOrders}</span>
                    </div>
                </div>
                <div className="stat-card-widget">
                    <div className="stat-widget-icon gold"><AppstoreOutlined /></div>

                    <div className="stat-widget-content">
                        <span className="stat-widget-label">Products</span>
                        <span className="stat-widget-value">{loading ? <Skeleton.Button active size="small" /> : stats.totalProducts}</span>
                    </div>
                </div>
                <div className="stat-card-widget">
                    <div className="stat-widget-icon purple"><UserOutlined /></div>

                    <div className="stat-widget-content">
                        <span className="stat-widget-label">Users</span>
                        <span className="stat-widget-value">{loading ? <Skeleton.Button active size="small" /> : stats.totalUsers}</span>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]} className="dashboard-row">
                <Col xs={24} lg={16}>
                    <Card className="dashboard-card" title={<span><RiseOutlined /> Revenue Analytics</span>}>
                        {loading ? <Skeleton active /> : (
                            revenueChartData.length > 0
                                ? <Area {...revenueConfig} />
                                : <div style={{textAlign:'center', padding: 50, color: '#999'}}>Not enough data for chart</div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="dashboard-card" title={<span><PieChartOutlined /> Order Status</span>}>
                        {loading ? <Skeleton active /> : (
                            statusChartData.length > 0
                                ? <Pie {...pieConfig} label={false}/>
                                : <div style={{textAlign:'center', padding: 50, color: '#999'}}>No order data</div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} className="dashboard-row">
                <Col xs={24} lg={14}>
                    <Card className="dashboard-card" bodyStyle={{padding: '24px 22px'}} style={{height: '100%'}}>
                        <div style={{padding: '0 0 12px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24}} className="dashboard-card-title">
                            <span>Recent Orders</span>
                        </div>
                        <Table
                            columns={recentOrderColumns}
                            dataSource={recentOrders}
                            pagination={false}
                            rowKey="id"
                            loading={loading}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card className="dashboard-card" bodyStyle={{padding: '24px 22px'}} style={{height: '100%'}}>
                        <div style={{padding: '0 0 12px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24}} className="dashboard-card-title">
                            <span>Top Spenders</span>
                        </div>
                        <Table
                            columns={topCustomerColumns}
                            dataSource={topCustomers}
                            pagination={false}
                            rowKey={(record) => record.id || Math.random()}
                            loading={loading}
                            size="small"
                            locale={{emptyText: 'No data'}}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;