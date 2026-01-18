import { Collapse, theme } from "antd"
import { fakeDescription } from "./fakeDescription"
import SpecificationDescriptionTemplate from "./SpecificationDescriptionTemplate/SpecificationDescriptionTemplate"
import './SpecificationDescription.css'


const SpecificationDescription = () => {
    return (
        <>
            <Collapse
                bordered={false}
                expandIconPosition="right"
                items={fakeDescription.map(des => {
                    const { token } = theme.useToken();

                    return ({
                        key: des.group,
                        label: <span style={{ fontWeight: 600 }}>{des.group}</span>,
                        children: <SpecificationDescriptionTemplate specifications={des.specifications} />,
                        style: {
                            marginBottom: 16,
                            background: "#fff",
                            borderRadius: token.borderRadiusLG,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            // padding: "4px 8px",
                        }
                    });
                })}
                style={{
                    textAlign: "left",
                    background: "transparent",
                }}
            />
        </>
    )
}

export default SpecificationDescription