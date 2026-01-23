import React, { useState, useEffect } from "react";
import reportService from "../../../services/reportService";
import {
    Card,
    DatePicker,
    Select,
    Button,
    Typography,
    Row,
    Col,
    Table,
    message,
    Skeleton,
    Space,
    Statistic,
    Divider
} from "antd";
import {
    ExportOutlined,
    ReloadOutlined,
    DollarOutlined,
    RollbackOutlined,
    RiseOutlined,
    FileExcelOutlined,
    PieChartOutlined
} from "@ant-design/icons";
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import "./RevenueReport.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueReport = () => {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [groupBy, setGroupBy] = useState('day');

    const [reportData, setReportData] = useState({
        summary: { totalIncome: 0, totalRefund: 0, netRevenue: 0 },
        rows: [],
        details: { totalCompletedPayments: 0, totalApprovedReturns: 0, totalApprovedCancellations: 0 }
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const fetchReport = async () => {
        if (!dateRange || dateRange.length !== 2) return;

        setLoading(true);
        try {
            const params = {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
                groupBy: groupBy
            };

            const response = await reportService.getRevenueReport(params);

            if (response.success && response.data) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load revenue report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, groupBy]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
                groupBy: groupBy
            };

            const blob = await reportService.exportRevenueReport(params);

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', `revenue_report_${groupBy}_${dayjs().format('YYYYMMDD')}.xlsx`);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            message.success("Report downloaded successfully");
        } catch (error) {
            console.error(error);
            message.error(error.message || "Failed to export report");
        } finally {
            setExporting(false);
        }
    };


    const columnChartData = reportData.rows.flatMap(item => [
        {
            period: item.period,
            type: 'Income',
            value: item.income
        },
        {
            period: item.period,
            type: 'Net Revenue',
            value: item.netRevenue
        },
    ]);

    const columnConfig = {
        data: columnChartData,
        isGroup: true,
        xField: 'period',
        yField: 'value',
        seriesField: 'type',
        color: ['#1890ff', '#52c41a'],
        columnStyle: { radius: [4, 4, 0, 0] },
        yAxis: { label: { formatter: (v) => `${(v / 1000000).toFixed(0)}M` } },
        tooltip: { formatter: (datum) => ({ name: datum.type, value: formatCurrency(datum.value) }) },
        height: 300,
    };

    const pieChartData = [
        {
            type: 'Completed Payments',
            value: reportData.details.totalCompletedPayments
        },
        {
            type: 'Returns',
            value: reportData.details.totalApprovedReturns
        },
        {
            type: 'Cancellations',
            value: reportData.details.totalApprovedCancellations
        },
    ].filter(d => d.value > 0);

    const pieConfig = {
        data: pieChartData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            text: (d) => `${d.value}`,
            style: { fontWeight: 'bold' },
        },
        legend: {
            color: {
                title: false,
                position: 'bottom',
                rowPadding: 5,
            },
        },
        color: ({ type }) => {
            if (type === 'Completed Payments') return '#52c41a';
            if (type === 'Returns') return '#1890ff';
            return '#ff4d4f';
        },
        height: 300,
    };

    const columns = [
        {
            title: 'Period',
            dataIndex: 'period',
            key: 'period',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Income',
            dataIndex: 'income',
            key: 'income',
            align: 'right',
            render: (val) => <Text style={{color: '#1890ff'}}>{formatCurrency(val)}</Text>
        },
        {
            title: 'Refund',
            dataIndex: 'refund',
            key: 'refund',
            align: 'right',
            render: (val) => <Text style={{color: '#ff4d4f'}}>{val > 0 ? `-${formatCurrency(val)}` : formatCurrency(val)}</Text>
        },
        {
            title: 'Net Revenue',
            dataIndex: 'netRevenue',
            key: 'netRevenue',
            align: 'right', render: (val) => <Text strong style={{color: '#52c41a'}}>{formatCurrency(val)}</Text>
        }
    ];

    return (
        <div className="revenue-report-page">
            <div className="report-header">
                <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Revenue Analytics</Title>

                <div className="report-filters">
                    <Space>
                        <Text strong>Period:</Text>

                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            allowClear={false}
                            style={{width: 260}}
                        />

                        <Text strong style={{marginLeft: 8}}>Group By:</Text>

                        <Select value={groupBy} onChange={setGroupBy} style={{width: 100}}>
                            <Option value="day">Day</Option>
                            <Option value="month">Month</Option>
                            <Option value="year">Year</Option>
                        </Select>

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

            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon income"><DollarOutlined /></div>
                    <div className="summary-content">
                        <span className="summary-label">Total Income</span>

                        <span className="summary-value">
                            {loading ? <Skeleton.Button active size="small" /> : formatCurrency(reportData.summary.totalIncome)}
                        </span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon refund"><RollbackOutlined /></div>
                    <div className="summary-content">
                        <span className="summary-label">Total Refund</span>

                        <span className="summary-value" style={{color: '#ff4d4f'}}>
                            {loading ? <Skeleton.Button active size="small" /> : formatCurrency(reportData.summary.totalRefund)}
                        </span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon net"><RiseOutlined /></div>

                    <div className="summary-content">
                        <span className="summary-label">Net Revenue</span>
                        <span className="summary-value" style={{color: '#52c41a'}}>
                            {loading ? <Skeleton.Button active size="small" /> : formatCurrency(reportData.summary.netRevenue)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="chart-section" style={{marginBottom: 24}}>
                <div className="section-title">Revenue Trends</div>
                {loading ? <Skeleton active paragraph={{rows: 6}} /> : (
                    <Column {...columnConfig} />
                )}
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <div className="table-section" style={{height: '100%'}}>
                        <div className="section-title">Detailed Logs</div>
                        <Table
                            columns={columns}
                            dataSource={reportData.rows}
                            rowKey="period"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            size="middle"
                        />
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <div className="chart-section" style={{height: '100%', marginBottom: 0}}>
                        <div className="section-title"><PieChartOutlined /> Transaction Breakdown</div>
                        <Divider style={{margin: '12px 0'}} />
                        {loading ? <Skeleton active paragraph={{rows: 4}} /> : (
                            pieChartData.length > 0 ? (
                                <Pie {...pieConfig} />
                            ) : (
                                <div style={{textAlign:'center', padding: '40px 0', color: '#999'}}>
                                    No transaction data
                                </div>
                            )
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RevenueReport;