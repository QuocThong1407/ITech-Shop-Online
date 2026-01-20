import React from "react"
import { Button } from "antd"
import './QuantitySelector.css'

const QuantitySelector = ({ amount, setAmount, stockQuantity }) => {
    return (
        <div className="info__quantity">
            <Button
                shape="circle"
                onClick={() => setAmount(prev => prev - 1)}
                disabled={amount === 1}
            >-</Button>
            <div className="quantity__value">{amount}</div>
            <Button shape="circle" onClick={() => setAmount(prev => prev + 1)} disabled={amount === stockQuantity}>+</Button>
        </div>
    )
}

export default QuantitySelector
