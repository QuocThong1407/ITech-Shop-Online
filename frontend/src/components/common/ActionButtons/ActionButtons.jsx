import { Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

export default function ActionButtons({ 
  onEdit, 
  onDelete, 
  onView,
  showView = false,
  deleteConfirmTitle = "Delete Item",
  deleteConfirmDesc = "Are you sure you want to delete this item?"
}) {
  return (
    <Space size="small">
      {onView && showView && (
        <Button 
          icon={<EyeOutlined />}
          size="small" 
          onClick={onView}
        >
          View
        </Button>
      )}
      {onEdit && (
        <Button 
          icon={<EditOutlined />}
          size="small"
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
      {onDelete && (
        <Popconfirm
          title={deleteConfirmTitle}
          description={deleteConfirmDesc}
          onConfirm={onDelete}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
          >
            Delete
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
}
