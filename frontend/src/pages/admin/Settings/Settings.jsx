import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Form,
    InputNumber,
    Button,
    Tabs,
    message,
    Spin,
    Typography,
    Row,
    Col,
    Divider,
    Alert,
    Switch,
    Input
} from "antd";
import {
    SaveOutlined,
    SettingOutlined,
    RocketOutlined,
    CrownOutlined,
    PercentageOutlined,
    CarOutlined,
    GiftOutlined
} from "@ant-design/icons";
import systemService from "../../../services/systemService";
import "./Settings.css";

const { Title, Text } = Typography;

const Settings = () => {
    const [loading, setLoading] = useState(false);

    const [vatForm] = Form.useForm();
    const [shippingForm] = Form.useForm();

    const [membershipTierForm] = Form.useForm();
    const [membershipBenefitForm] = Form.useForm();

    const [tiers, setTiers] = useState([]);
    const [benefits, setBenefits] = useState([]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [vatRes, shipRes, tierRes, benefitRes] = await Promise.all([
                systemService.getVatRate(),
                systemService.getShippingFees(),
                systemService.getMembershipTiers(),
                systemService.getMembershipBenefits()
            ]);
            
            if (vatRes.success && vatRes.data) {
                vatForm.setFieldsValue({ rate: vatRes.data.value.rate });
            }

            if (shipRes.success && shipRes.data) {
                const standard = shipRes.data.find(s => s.type === 'STANDARD');
                if (standard && standard.config) {
                    shippingForm.setFieldsValue({
                        baseFee: standard.config.baseFee,
                        feePerKm: standard.config.feePerKm,
                        freeShippingThreshold: standard.config.freeShippingThreshold,
                        maxDistance: standard.config.maxDistance,
                        description: standard.description
                    });
                }
            }

            if (tierRes.success && tierRes.data) {
                setTiers(tierRes.data);
                const tierValues = {};
                tierRes.data.forEach(t => {
                    tierValues[`${t.name}_min`] = t.config.min;
                    tierValues[`${t.name}_max`] = t.config.max;
                });
                membershipTierForm.setFieldsValue(tierValues);
            }

            if (benefitRes.success && benefitRes.data) {
                setBenefits(benefitRes.data);
                const benefitValues = {};
                benefitRes.data.forEach(b => {
                    benefitValues[`${b.tier}_discount`] = b.benefits.discountPercentage;
                    benefitValues[`${b.tier}_freeShip`] = b.benefits.freeShipping;
                    benefitValues[`${b.tier}_priority`] = b.benefits.prioritySupport;
                    benefitValues[`${b.tier}_early`] = b.benefits.earlyAccess;
                });
                membershipBenefitForm.setFieldsValue(benefitValues);
            }

        } catch (error) {
            console.error(error);
            message.error("Failed to load system configurations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [vatForm, shippingForm, membershipTierForm, membershipBenefitForm]);


    const handleSaveGeneral = async () => {
        try {
            setLoading(true);
            // const vatValues = await vatForm.validateFields();
            // await systemService.updateVatRate(vatValues.rate);

            const shipValues = await shippingForm.validateFields();
            await systemService.updateShippingFee('STANDARD', shipValues);

            message.success("General settings updated successfully!");
            fetchAllData();
        } catch (error) {
            console.error(error);
            message.error("Error saving general settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMembership = async () => {
        try {
            setLoading(true);

            const tierValues = await membershipTierForm.validateFields();
            const tierPromises = tiers.map(t => {
                const payload = {
                    min: tierValues[`${t.name}_min`],
                    max: tierValues[`${t.name}_max`]
                };
                return systemService.updateMembershipTier(t.name, payload);
            });

            const benefitValues = await membershipBenefitForm.validateFields();
            const benefitPromises = benefits.map(b => {
                const payload = {
                    discountPercentage: benefitValues[`${b.tier}_discount`],
                    freeShipping: benefitValues[`${b.tier}_freeShip`],
                    prioritySupport: benefitValues[`${b.tier}_priority`],
                    earlyAccess: benefitValues[`${b.tier}_early`]
                };
                return systemService.updateMembershipBenefit(b.tier, payload);
            });

            await Promise.all([...tierPromises, ...benefitPromises]);

            message.success("Membership settings updated successfully!");
            fetchAllData();
        } catch (error) {
            console.error(error);
            message.error("Error saving membership settings");
        } finally {
            setLoading(false);
        }
    };


    const GeneralTab = () => (
        <div className="settings-tab-content">
            <Row gutter={[24, 24]}>
                {/*<Col span={24}>*/}
                {/*    <Card title={<span><PercentageOutlined /> VAT Rate (Value Added Tax)</span>} size="small">*/}
                {/*        <Form form={vatForm} layout="vertical">*/}
                {/*            <Form.Item*/}
                {/*                name="rate"*/}
                {/*                label="VAT Rate (%)"*/}
                {/*                help="Applies to all orders."*/}
                {/*                rules={[{ required: true, message: 'Please enter VAT rate' }]}*/}
                {/*            >*/}
                {/*                <InputNumber min={0} max={100} addonAfter="%" style={{ width: 200 }} />*/}
                {/*            </Form.Item>*/}
                {/*        </Form>*/}
                {/*    </Card>*/}
                {/*</Col>*/}

                <Col span={24}>
                    <Card title={<span><CarOutlined /> Shipping Fees (Standard)</span>} size="small">
                        <Form form={shippingForm} layout="vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item name="baseFee" label="Base Fee" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} addonAfter="₫" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="feePerKm" label="Fee per Km" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} addonAfter="₫" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="freeShippingThreshold" label="Free Shipping Threshold (Order Value >)">
                                        <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} addonAfter="₫" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="maxDistance" label="Max Delivery Distance (Km)">
                                        <InputNumber style={{ width: '100%' }} addonAfter="Km" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="description" label="Description / Notes">
                                        <Input.TextArea rows={3} placeholder="Optional notes about this shipping configuration" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <div className="form-actions" style={{ marginTop: 12, textAlign: 'right' }}>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSaveGeneral} loading={loading} style={{background: '#008ECC'}}>
                    Save General Settings
                </Button>
            </div>
        </div>
    );

    const MembershipTab = () => (
        <div className="settings-tab-content">
            <Alert
                message="Important Note"
                description="Changing spending thresholds (Min/Max) will affect member tier classification in the next system update cycle."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title={<span><CrownOutlined /> Membership Tiers Configuration</span>} size="small">
                        <Form form={membershipTierForm} layout="vertical">
                            {tiers.map(tier => (
                                <div key={tier.id} className="tier-row" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed #eee' }}>
                                    <Text strong style={{ fontSize: 16, color: tier.name === 'GOLD' ? '#faad14' : (tier.name === 'SILVER' ? '#7d7d7d' : '#8c5400') }}>
                                        {tier.name}
                                    </Text>
                                    <Row gutter={16} style={{ marginTop: 8 }}>
                                        <Col span={12}>
                                            <Form.Item
                                                name={`${tier.name}_min`}
                                                label="Min Spending"
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} addonAfter="₫" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name={`${tier.name}_max`}
                                                label="Max Spending"
                                            >
                                                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} addonAfter="₫" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Form>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<span><GiftOutlined /> Tier Benefits</span>} size="small">
                        <Form form={membershipBenefitForm} layout="vertical">
                            {benefits.map(benefit => (
                                <div key={benefit.id} className="benefit-row" style={{ marginBottom: 24, background: '#fafafa', padding: 16, borderRadius: 8 }}>
                                    <Text strong style={{ fontSize: 15 }}>Benefits for: {benefit.tier}</Text>
                                    <Row gutter={24} style={{ marginTop: 12 }}>
                                        <Col span={6}>
                                            <Form.Item
                                                name={`${benefit.tier}_discount`}
                                                label="Discount (%)"
                                            >
                                                <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={`${benefit.tier}_freeShip`}
                                                label="Free Shipping"
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={`${benefit.tier}_priority`}
                                                label="Priority Support"
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={`${benefit.tier}_early`}
                                                label="Early Access"
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Form>
                    </Card>
                </Col>
            </Row>

            <div className="form-actions" style={{ marginTop: 24, textAlign: 'right' }}>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSaveMembership} loading={loading} style={{background: '#008ECC'}}>
                    Save Membership Settings
                </Button>
            </div>
        </div>
    );

    const items = [
        {
            key: 'general',
            label: <span><SettingOutlined /> General (VAT & Ship)</span>,
            children: <GeneralTab />
        },
        {
            key: 'membership',
            label: <span><CrownOutlined /> Membership</span>,
            children: <MembershipTab />
        },
    ];

    return (
        <div className="settings-page">
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{margin: 0, color: '#008ECC', fontWeight: '700'}}>System Configuration</Title>
            </div>

            <Tabs defaultActiveKey="general" items={items} type="card" size="large" />
        </div>
    );
};

export default Settings;