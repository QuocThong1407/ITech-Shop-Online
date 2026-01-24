import { Button, Card, Rate, Slider, Space, Select, Typography, Divider, Collapse, Grid } from "antd";
import { ReloadOutlined, FilterOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import './ProductFilters.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ProductFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 100000000]);
    const [minRating, setMinRating] = useState(initialFilters.minRating || 0);
    const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'name');
    const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder || 'asc');
    
    const screens = useBreakpoint();

    // Format price to VND
    const formatVND = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(0)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toString();
    };

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
            maxPrice: 100000000,
            minRating: 0,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        setPriceRange([0, 100000000]);
        setMinRating(0);
        setSortBy('name');
        setSortOrder('asc');

        // Notify parent of multiple changes
        Object.entries(defaultFilters).forEach(([key, value]) => {
            onFilterChange(key, value);
        });
    };

    // Check if mobile view (xs breakpoint)
    const isMobile = !screens.sm;

    const filterContent = (
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
                <Text strong>Price Range</Text>
                <Slider
                    range
                    value={priceRange}
                    min={0}
                    max={100000000}
                    step={1000000}
                    tooltip={{ formatter: val => formatVND(val) }}
                    onChange={(val) => setPriceRange(val)}
                    onChangeComplete={(val) => {
                        onFilterChange('minPrice', val[0]);
                        onFilterChange('maxPrice', val[1]);
                    }}
                    style={{ marginTop: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">{formatVND(priceRange[0])}</Text>
                    <Text type="secondary">{formatVND(priceRange[1])}</Text>
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
    );

    // Mobile: Collapsible dropdown
    if (isMobile) {
        const collapseItems = [
            {
                key: '1',
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span><FilterOutlined style={{ marginRight: 8 }} />Filters</span>
                        <Button 
                            type="link" 
                            onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                            icon={<ReloadOutlined />} 
                            size="small"
                        >
                            Reset
                        </Button>
                    </div>
                ),
                children: filterContent
            }
        ];

        return (
            <div className="product-filters-mobile">
                <Collapse 
                    items={collapseItems}
                    bordered={false}
                    style={{ 
                        background: '#fff', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        marginBottom: '16px'
                    }}
                />
            </div>
        );
    }

    // Desktop: Card sidebar
    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>Filters</Title>}
            extra={<Button type="link" onClick={handleReset} icon={<ReloadOutlined />}>Reset</Button>}
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            className="product-filters-desktop"
        >
            {filterContent}
        </Card>
    );
};

export default ProductFilters;