import {Button} from "antd";
import "./PrimaryButton.css"

const PrimaryButton = ({children, ...props}) => {
    return (
        <Button className="primary-btn"
                shape="round"
                size="large"
                {...props}>
            {children}
        </Button>
    )
}

export default PrimaryButton;