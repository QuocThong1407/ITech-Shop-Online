import { Tag } from 'antd';

export default function StockBadge({ quantity }) {
  if (quantity === 0) {
    return <Tag color="red">Out of Stock</Tag>;
  }
  if (quantity < 10) {
    return <Tag color="orange">Low Stock ({quantity})</Tag>;
  }
  return <Tag color="green">In Stock ({quantity})</Tag>;
}
