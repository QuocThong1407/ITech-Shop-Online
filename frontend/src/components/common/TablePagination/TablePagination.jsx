import { Pagination, Row, Col } from 'antd';

export default function TablePagination({ 
  current, 
  pageSize, 
  total, 
  onChange 
}) {
  return (
    <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
      <Col>
        <span>
          Showing {(current - 1) * pageSize + 1} to {Math.min(current * pageSize, total)} of {total} results
        </span>
      </Col>
      <Col>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={onChange}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Col>
    </Row>
  );
}
