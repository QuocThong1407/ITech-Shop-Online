import React, { useState, useEffect, useCallback } from "react";
import reportService from "../../../services/reportService";
import {
    Card, DatePicker, Button, Typography, Row, Col,
    Table, message, Skeleton, Space, Tabs, Tag, Avatar, Divider
} from "antd";
import {
    ReloadOutlined, FileExcelOutlined, UserOutlined,
    UserAddOutlined, ShoppingCartOutlined, StarOutlined,
    TeamOutlined, SolutionOutlined, SafetyCertificateOutlined,
    PieChartOutlined, RiseOutlined
} from "@ant-design/icons";
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import "./ActivityReport.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ActivityReport = () => {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);

    const [data, setData] = useState({
        summary: {
            totalActiveUsers: 0,
            newUsers: 0,
            newOrders: 0,
            newReviews: 0,
            newUsersByRole: { CUSTOMER: 0, SELLER: 0 }
        },
        activities: {
            customers: [],
            sellers: [],
            admins: []
        },
        statistics: {
            totalCustomers: 0,
            totalSellers: 0,
            totalAdmins: 0
        }
    });

    const fetchReport = async () => {
        if (!dateRange || dateRange.length !== 2) return;

        setLoading(true);
        try {
            const params = {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD')
            };

            const response = await reportService.getActivityReport(params);
            if (response.success && response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load activity report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD')
            };

            const blob = await reportService.exportActivityReport(params);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity_report_${dayjs().format('YYYYMMDD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success("Activity report downloaded successfully");
        } catch (error) {
            message.error(error.message || "Failed to export report");
        } finally {
            setExporting(false);
        }
    };

    const pieData = [
        {
            type: 'Customers',
            value: data.statistics.totalCustomers },
        {
            type: 'Sellers',
            value: data.statistics.totalSellers
        },
        {
            type: 'Admins',
            value: data.statistics.totalAdmins
        },
    ].filter(d => d.value > 0);

    const pieConfig = {
        data: pieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            text: (d) => `${d.value}`,
            style: { fontWeight: 'bold' },
        },
        legend: {
            color: { title: false, position: 'bottom', rowPadding: 5 },
        },
        color: ({ type }) => {
            if (type === 'Customers') return '#1890ff';
            if (type === 'Sellers') return '#fa8c16';
            return '#722ed1';
        },
        height: 280,
    };

    const commonColumns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#f56a00' }}>{record.username?.charAt(0).toUpperCase()}</Avatar>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <Text strong>{record.username}</Text>
                        <Text type="secondary" style={{fontSize: 11}}>{record.email}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Account Created',
            dataIndex: 'accountCreated',
            render: (date) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            render: (date) => (
                <Text type="secondary" style={{fontSize: 12}}>
                    {dayjs(date).format("DD/MM/YYYY HH:mm")}
                </Text>
            )
        }
    ];

    const customerColumns = [
        ...commonColumns,
        {
            title: 'Orders Placed',
            dataIndex: 'totalOrders',
            align: 'center',
            render: (val) => <Tag color="blue">{val} Orders</Tag>
        }
    ];

    const sellerColumns = [
        ...commonColumns,
        {
            title: 'Total Products',
            dataIndex: 'totalProducts',
            align: 'center',
            render: (val) => <Tag color="orange">{val} Products</Tag>
        }
    ];

    const adminColumns = [
        ...commonColumns,
        {
            title: 'Reports Generated',
            dataIndex: 'totalReportsGenerated',
            align: 'center',
            render: (val) => <Tag color="purple">{val} Reports</Tag>
        }
    ];

    const tabItems = [
        {
            key: 'customers',
            label: <span><TeamOutlined /> Customers</span>,
            children: <Table columns={customerColumns} dataSource={data.activities.customers} rowKey="userId" loading={loading} pagination={{pageSize: 5}} size="small"/>
        },
        {
            key: 'sellers',
            label: <span><SolutionOutlined /> Sellers</span>,
            children: <Table columns={sellerColumns} dataSource={data.activities.sellers} rowKey="userId" loading={loading} pagination={{pageSize: 5}} size="small"/>
        },
        {
            key: 'admins',
            label: <span><SafetyCertificateOutlined /> Admins</span>,
            children: <Table columns={adminColumns} dataSource={data.activities.admins} rowKey="userId" loading={loading} pagination={{pageSize: 5}} size="small"/>
        }
    ];

    return (
        <div className="activity-report-page">
            <div className="report-header">
                <Title level={2} className="page-title">Activity Logs</Title>
                <div className="report-filters">
                    <Space>
                        <Text strong>Time Range:</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            allowClear={false}
                            style={{width: 260}}
                        />
                        <Button
                            type="primary"
                            icon={exporting ? <div className="ant-btn-loading-icon"></div> : <FileExcelOutlined />}
                            onClick={handleExport}
                            loading={exporting}
                            style={{backgroundColor: '#217346', borderColor: '#217346', marginLeft: 16}}
                        >
                            Export Excel
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchReport} />
                    </Space>
                </div>
            </div>

            <Row gutter={24}>
                <Col xs={24} xl={16}>
                    <div className="activity-summary-grid">
                        <div className="summary-card">
                            <div className="summary-icon users"><UserOutlined /></div>
                            <div className="summary-content">
                                <span className="summary-label">Total Active</span>
                                <span className="summary-value">
                                    {loading ? <Skeleton.Button active size="small" /> : data.summary.totalActiveUsers}
                                </span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon new-users"><UserAddOutlined /></div>
                            <div className="summary-content">
                                <span className="summary-label">New Users</span>
                                <span className="summary-value" style={{color: '#722ed1'}}>
                                    {loading ? <Skeleton.Button active size="small" /> : data.summary.newUsers}
                                </span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon orders"><ShoppingCartOutlined /></div>
                            <div className="summary-content">
                                <span className="summary-label">New Orders</span>
                                <span className="summary-value" style={{color: '#fa8c16'}}>
                                    {loading ? <Skeleton.Button active size="small" /> : data.summary.newOrders}
                                </span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon reviews"><StarOutlined /></div>
                            <div className="summary-content">
                                <span className="summary-label">New Reviews</span>
                                <span className="summary-value" style={{color: '#52c41a'}}>
                                    {loading ? <Skeleton.Button active size="small" /> : data.summary.newReviews}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="activity-details-section">
                        <div className="section-title"><SolutionOutlined /> User Activity Details</div>
                        <Tabs defaultActiveKey="customers" items={tabItems} />
                    </div>
                </Col>

                <Col xs={24} xl={8}>
                    <div className="activity-chart-section">
                        <div className="section-title"><PieChartOutlined /> User Distribution</div>
                        <Divider style={{margin: '12px 0'}} />

                        {loading ? <Skeleton active paragraph={{rows: 6}} /> : (
                            <>
                                <Pie {...pieConfig} />

                                <div className="new-users-breakdown">
                                    <div className="breakdown-header">
                                        <span className="breakdown-title">
                                            <RiseOutlined style={{color: '#1890ff'}}/> Growth (New Users)
                                        </span>
                                    </div>
                                    <div className="breakdown-list">
                                        <div className="breakdown-item">
                                            <div className="breakdown-info">
                                                <div className="breakdown-icon-box customer">
                                                    <TeamOutlined />
                                                </div>
                                                <span className="breakdown-label">New Customers</span>
                                            </div>
                                            <Tag color="blue" className="breakdown-value-tag">
                                                +{data.summary.newUsersByRole?.CUSTOMER || 0}
                                            </Tag>
                                        </div>

                                        <div className="breakdown-item">
                                            <div className="breakdown-info">
                                                <div className="breakdown-icon-box seller">
                                                    <SolutionOutlined />
                                                </div>
                                                <span className="breakdown-label">New Sellers</span>
                                            </div>
                                            <Tag color="orange" className="breakdown-value-tag">
                                                +{data.summary.newUsersByRole?.SELLER || 0}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ActivityReport;