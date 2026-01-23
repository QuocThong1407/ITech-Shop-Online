import { Statistic, Row, Col, Card } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, StockOutlined } from '@ant-design/icons';

export default function ProductStats({ products }) {
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.soldCount || 0)), 0);
  const totalSold = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Total Revenue"
            value={totalRevenue}
            prefix={<DollarOutlined />}
            formatter={(value) => `$${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Total Sold"
            value={totalSold}
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Total Stock"
            value={totalStock}
            prefix={<StockOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
}
