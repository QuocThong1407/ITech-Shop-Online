import {useCallback, useEffect, useState} from "react";
import userService from "../../../services/userService.js";
import {Avatar, Badge, Button, Drawer, Form, Input, message, Modal, Select, Table, Tabs, Tag, Typography} from "antd";
import {
    MailOutlined,
    UserOutlined,
    CrownOutlined,
    ShopOutlined,
    DeleteOutlined,
    EyeOutlined,
    TeamOutlined,
    UserAddOutlined,
    SearchOutlined,
    EditOutlined,
    LockOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import "./Users.css"

const { Title} = Typography;

const Users = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('customers');
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, customers: 0, sellers: 0, admins: 0 });
    const [searchText, setSearchText] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [addLoading, setAddLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [form] = Form.useForm();
    const [addForm] = Form.useForm();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0,
    });

    const fetchStats = async () => {
        try {
            const response = await userService.getUserStatistics();

            if (response) setStats(response.data);
        }
        catch (error) {
            console.error("Failed to fetch stats");
        }
    }

    const fetchUsers = async (page, pageSize, search, tab) => {
        setLoading(true);
        try {
            let roleParam = "CUSTOMER";
            if (tab === "sellers") roleParam = "SELLER";
            if (tab === "admins") roleParam = "ADMIN";

            const response = await userService.getAllUsers({
                page: page,
                limit: pageSize,
                role: roleParam,
                search: search,
            });

            if (response && response.data) {
                setData(response.data?.users);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                }));
            }
        }
        catch (error) {
            console.error("Failed to fetch users");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchStats();
            await fetchUsers(
                pagination.current,
                pagination.pageSize,
                searchText,
                activeTab
            );
        };

        loadData();
    }, [pagination.current, pagination.pageSize, searchText, activeTab])

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination(prev => ({ ...prev, current: 1 }));
        setSearchText('');
        setLoading(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete User?',
            content: 'This action will permanently delete your account and related data. Are you sure about this?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await userService.deleteUser(id);
                    messageApi.open({
                        type: 'success',
                        content: 'User deleted successfully!',
                    });
                    fetchStats();
                    fetchUsers(pagination.current, pagination.pageSize, searchText, activeTab);
                } catch (error) {
                    console.error(error);
                    messageApi.open({
                        type: 'error',
                        content: error.message || 'Failed to delete customer!',
                    });
                }
            }
        });
    };

    const handleView = (record) => {
        setSelectedUser(record);
        setViewModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedUser(record);

        form.setFieldsValue({
            username: record.username,
            email: record.email,
            role: record.role,
        });
        setIsEditModalOpen(true);
    };

    const submitEdit = async () => {
        setEditLoading(true);
        try {
            const values = await form.validateFields();

            await userService.updateUser(selectedUser.id, values);

            messageApi.open({
                type: 'success',
                content: "User updated successfully!"
            });

            setIsEditModalOpen(false);

            fetchUsers(pagination.current, pagination.pageSize, searchText, activeTab);
        }
        catch (error) {
            console.error("Validate Failed:", error);
            messageApi.open({
                type: 'error',
                content: 'User updated failed!',
            });
        }
        finally {
            setEditLoading(false);
        }
    };

    const handleAdd = () => {
        addForm.resetFields();
        setIsAddModalOpen(true);
    };

    const submitAdd = async () => {
        setAddLoading(true);
        try {
            const values = await addForm.validateFields();

            await userService.createUser(values);

            messageApi.open({
                type: 'success',
                content: "User created successfully!"
            });

            setIsAddModalOpen(false);

            fetchStats();
            fetchUsers(pagination.current, pagination.pageSize, searchText, activeTab);
        }
        catch (error) {
            console.error("Validate Failed:", error);
            messageApi.open({
                type: 'error',
                content: 'User created failed!',
            });
        }
        finally {
            setAddLoading(false);
        }
    };

    const columns = [
        {
            title: "User Name",
            dataIndex: "username",
            key: "username",
            render: (text, record) => (
                <div className="user-cell">
                    <Avatar
                        size={42}
                        style={{
                            backgroundColor: record.role === 'ADMIN' ? '#ff4d4f' : (record.role === 'SELLER' ? '#faad14' : '#008ECC'),
                            fontSize: '18px',
                            verticalAlign: 'middle'
                        }}
                    >
                        {text ? text.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <div className="user-info-col">
                        <span className="user-name">{text}</span>
                        <span className="user-id">ID: {record.id.substring(0, 8)}...</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <span style={{color: '#555'}}>
                    <MailOutlined style={{marginRight: 8, color: '#999'}}/>{email}
                </span>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'blue';
                let icon = <UserOutlined/>;
                if (role === 'ADMIN') {
                    color = 'red';
                    icon = <CrownOutlined/>;
                }
                if (role === 'SELLER') {
                    color = 'gold';
                    icon = <ShopOutlined/>;
                }
                return (
                    <Tag color={color} icon={icon} style={{borderRadius: '12px', padding: '0 10px', fontWeight: 500}}>
                        {role}
                    </Tag>
                )
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Badge
                    status={record.emailVerified ? 'success' : 'warning'}
                    text={record.emailVerified ? 'Verified' : 'Unverified'}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button size="small"
                            icon={<EyeOutlined style={{ color: '#008ECC' }} />}
                            onClick={() => handleView(record)}>
                        View
                    </Button>
                    <Button size="small"
                            icon={<EditOutlined style={{ color: '#faad14' }} />}
                            onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ]

    const tabItems = [
        {
            key: 'customers',
            label: (
                <span><UserOutlined /> Customers </span>
            )
        },
        {
            key: 'sellers',
            label: (
                <span><ShopOutlined /> Sellers </span>
            )
        },
        {
            key: 'admins',
            label: (
                <span><CrownOutlined /> Admins </span>
            )
        },
    ];

    return (
        <>
            {contextHolder}

            <div className="users-page">
                <div className="page-header">
                    <div>
                        <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>Manage Users</Title>
                    </div>
                    <Button type="primary" icon={<UserAddOutlined/>}
                            style={{backgroundColor: '#008ECC'}}
                            onClick={handleAdd}>
                        Add User
                    </Button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon"><TeamOutlined/></div>
                        <div>
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                    </div>
                    <div className="stat-card customers">
                        <div className="stat-icon"><UserOutlined/></div>
                        <div>
                            <div className="stat-label">Customers</div>
                            <div className="stat-value">{stats.customers}</div>
                        </div>
                    </div>
                    <div className="stat-card sellers">
                        <div className="stat-icon"><ShopOutlined/></div>
                        <div>
                            <div className="stat-label">Sellers</div>
                            <div className="stat-value">{stats.sellers}</div>
                        </div>
                    </div>
                    <div className="stat-card admins">
                        <div className="stat-icon"><CrownOutlined/></div>
                        <div>
                            <div className="stat-label">Admins</div>
                            <div className="stat-value">{stats.admins}</div>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} className="user-tabs"/>

                    <div className="table-actions">
                        <Input
                            placeholder="Search by name or email..."
                            prefix={<SearchOutlined style={{color: '#ccc'}}/>}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{width: 400}}
                            allowClear
                        />
                    </div>

                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            onChange: (page, pageSize) => setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize
                            })),
                            showTotal: (total) => `Total ${total} results`
                        }}
                        className="users-table"
                    />
                </div>
            </div>

            <Modal
                title="Detailed Profile"
                centered
                open={viewModalOpen}
                onCancel={() => setViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={500}
            >
                {selectedUser && (
                    <div className="view-modal-content">
                        <div className="profile-header-center">
                            <Avatar size={80} style={{
                                backgroundColor: selectedUser.role === 'ADMIN' ? '#ff4d4f' : (selectedUser.role === 'SELLER' ? '#faad14' : '#008ECC'),
                                fontSize: '32px', marginBottom: '10px'
                            }}>
                                {selectedUser.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <h3 style={{margin: '0'}}>{selectedUser.username}</h3>
                            <Tag color="blue" style={{marginTop: '5px'}}>{selectedUser.role}</Tag>
                        </div>
                        <div className="info-list" style={{marginTop: '20px'}}>
                            <div className="info-item"><span className="label">ID:</span> <span
                                className="value">{selectedUser.id}</span></div>
                            <div className="info-item"><span className="label">Email:</span> <span
                                className="value">{selectedUser.email}</span></div>
                            <div className="info-item"><span className="label">Join Date:</span> <span
                                className="value">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="info-item"><span className="label">Status:</span>
                                <Tag color={selectedUser.emailVerified ? 'green' : 'red'}>
                                    {selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                                </Tag>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="Edit User Information"
                centered
                open={isEditModalOpen}
                onOk={submitEdit}
                onCancel={() => setIsEditModalOpen(false)}
                okText="Save Changes"
                confirmLoading={editLoading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="editUserForm"
                >
                    <Form.Item
                        name="username"
                        label="User Name"
                        rules={[{ required: true, message: 'Please input user name!' }]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[{ required: true, type: 'email' }]}
                    >
                        <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="CUSTOMER">Customer</Select.Option>
                            <Select.Option value="SELLER">Seller</Select.Option>
                            <Select.Option value="ADMIN">Admin</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Add New User"
                centered
                open={isAddModalOpen}
                onOk={submitAdd}
                onCancel={() => setIsAddModalOpen(false)}
                okText="Create User"
                confirmLoading={addLoading}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    name="addUserForm"
                >
                    <Form.Item
                        name="username"
                        label="User Name"
                        rules={[{ required: true, message: 'Please input user name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Invalid email format!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please input password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined/>} placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<CheckCircleOutlined />} placeholder="Confirm password" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        initialValue="CUSTOMER"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="CUSTOMER">Customer</Option>
                            <Option value="SELLER">Seller</Option>
                            <Option value="ADMIN">Admin</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default Users;