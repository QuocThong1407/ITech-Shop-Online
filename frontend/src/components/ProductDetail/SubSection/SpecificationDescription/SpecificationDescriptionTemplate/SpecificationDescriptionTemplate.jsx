import { Row, Col, Divider } from "antd"

const SpecificationDescriptionTemplate = ({ specifications }) => {
    return (
        <div style={{ padding: "6px 12px" }}>
            {specifications.map((spec, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <Row style={{ padding: "4px 0" }}>
                        <Col 
                            span={8} 
                            style={{ 
                                textAlign: "left", 
                                fontWeight: 600,
                                color: "#333"
                            }}
                        >
                            {spec.spec}
                        </Col>

                        <Col span={16} style={{ textAlign: "left", color: "#555" }}>
                            {spec.features.map((feat, idx) => (
                                <div 
                                    key={idx} 
                                    style={{ 
                                        margin: "2px 0", 
                                        fontSize: "14px", 
                                        lineHeight: 1.4 
                                    }}
                                    >
                                {feat}
                                </div>
                            ))}
                        </Col>
                    </Row>

                    {index !== specifications.length - 1 && (
                        <Divider style={{ margin: "8px 0", opacity: 0.2 }} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default SpecificationDescriptionTemplate
