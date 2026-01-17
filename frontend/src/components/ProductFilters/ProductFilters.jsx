import { Button, Card, Rate, Slider, Space, Select, Typography, Divider } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

const ProductFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 5000]);
    const [minRating, setMinRating] = useState(initialFilters.minRating || 0);
    const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'name');
    const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder || 'asc');

    // Sync with initialFilters if they change
    useEffect(() => {
        if (initialFilters.priceRange) setPriceRange(initialFilters.priceRange);
        if (initialFilters.minRating !== undefined) setMinRating(initialFilters.minRating);
        if (initialFilters.sortBy) setSortBy(initialFilters.sortBy);
        if (initialFilters.sortOrder) setSortOrder(initialFilters.sortOrder);
    }, [initialFilters]);

    const handleReset = () => {
        const defaultFilters = {
            minPrice: 0,
            maxPrice: 5000,
            minRating: 0,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        setPriceRange([0, 5000]);
        setMinRating(0);
        setSortBy('name');
        setSortOrder('asc');

        // Notify parent of multiple changes
        Object.entries(defaultFilters).forEach(([key, value]) => {
            onFilterChange(key, value);
        });
    };

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>Filters</Title>}
            extra={<Button type="link" onClick={handleReset} icon={<ReloadOutlined />}>Reset</Button>}
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">

                <div>
                    <Text strong>Sort By</Text>
                    <div style={{ marginTop: '8px' }}>
                        <Select
                            value={sortBy}
                            style={{ width: '100%', marginBottom: '8px' }}
                            onChange={(val) => {
                                setSortBy(val);
                                onFilterChange('sortBy', val);
                            }}
                        >
                            <Option value="name">Name</Option>
                            <Option value="price">Price</Option>
                            <Option value="rating">Rating</Option>
                        </Select>
                        <Select
                            value={sortOrder}
                            style={{ width: '100%' }}
                            onChange={(val) => {
                                setSortOrder(val);
                                onFilterChange('sortOrder', val);
                            }}
                        >
                            <Option value="asc">Ascending</Option>
                            <Option value="desc">Descending</Option>
                        </Select>
                    </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div>
                    <Text strong>Price Range ($)</Text>
                    <Slider
                        range
                        value={priceRange}
                        min={0}
                        max={5000}
                        step={10}
                        tooltip={{ formatter: val => `$${val}` }}
                        onChange={(val) => setPriceRange(val)}
                        onAfterChange={(val) => {
                            onFilterChange('minPrice', val[0]);
                            onFilterChange('maxPrice', val[1]);
                        }}
                        style={{ marginTop: '16px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">${priceRange[0]}</Text>
                        <Text type="secondary">${priceRange[1]}</Text>
                    </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div>
                    <Text strong>Minimum Rating</Text>
                    <div style={{ marginTop: '8px' }}>
                        <Rate
                            value={minRating}
                            onChange={(val) => {
                                setMinRating(val);
                                onFilterChange('minRating', val);
                            }}
                        />
                        <span style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                            {minRating > 0 ? `& Up` : 'Any'}
                        </span>
                    </div>
                </div>

            </Space>
        </Card>
    );
};

export default ProductFilters;