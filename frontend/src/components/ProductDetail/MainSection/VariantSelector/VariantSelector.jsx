import React from "react"
import { Button, Typography } from "antd"
import './VariantSelector.css'

const { Text } = Typography

// Helper to get attribute value case-insensitively
const getAttrValue = (attrs, key) => {
    if (!attrs) return undefined
    const lowerKey = key.toLowerCase()
    const foundKey = Object.keys(attrs).find(k => k.toLowerCase() === lowerKey)
    return foundKey ? attrs[foundKey] : undefined
}

const findMatchingKey = (variantOptions, type) => {
    const lowerType = type.toLowerCase()
    const keys = Object.keys(variantOptions)
    let key = keys.find(k => k.toLowerCase() === lowerType)
    if (!key) key = keys.find(k => k.toLowerCase().includes(lowerType))
    if (!key) {
        const pluralCandidates = [lowerType + "s", lowerType + "es", lowerType.replace(/y$/, "ies")]
        key = keys.find(k => pluralCandidates.some(p => k.toLowerCase() === p))
    }
    return key
}

const VariantSelector = ({
    variantTypes,
    variantOptions,
    productVariants,
    selectedAttributes,
    setSelectedAttributes
}) => {
    return (
        <div className="info__variants">
            {variantTypes.map((type) => {
                const optionsKey = findMatchingKey(variantOptions, type)
                if (!optionsKey) return null
                const options = variantOptions[optionsKey]

                return (
                    <div key={type} className="variant-group">
                        <Text strong>{type}:</Text>
                        <div className="variant-options">
                            {options.map((option) => {
                                const isValid = productVariants.some((v) => {
                                    // Build attributes excluding the current type being evaluated
                                    const otherAttributes = Object.entries(selectedAttributes)
                                        .filter(([key]) => key.toLowerCase() !== type.toLowerCase())

                                    // Check if variant matches other attributes AND has this option
                                    return otherAttributes.every(
                                        ([attrKey, attrValue]) =>
                                            getAttrValue(v.variantAttributes, attrKey) === attrValue
                                    ) && getAttrValue(v.variantAttributes, type) === option
                                })

                                const isSelected = selectedAttributes[type.toLowerCase()] === option

                                return (
                                    <Button
                                        key={option}
                                        disabled={!isValid}
                                        onClick={() => {
                                            setSelectedAttributes((prev) => {
                                                const key = type.toLowerCase()
                                                // If clicking the already selected option, deselect it
                                                if (prev[key] === option) {
                                                    const updated = { ...prev }
                                                    delete updated[key]
                                                    return updated
                                                }
                                                // Otherwise, select the new option (direct switching)
                                                return { ...prev, [key]: option }
                                            })
                                        }}
                                        className={`variant-option ${isSelected ? 'variant-option--active' : ''}`}
                                    >
                                        {option}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default VariantSelector

