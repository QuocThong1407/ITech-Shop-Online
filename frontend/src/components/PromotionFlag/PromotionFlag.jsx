import React, { useEffect, useState } from 'react'
import { Carousel, Card, Typography, Skeleton, Empty } from 'antd'
import { useNavigate } from 'react-router'
import promotionService from '../../services/promotionService'
import './PromotionFlag.css'

const { Title, Text } = Typography

const PromotionFlag = () => {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchActivePromotions = async () => {
            try {
                setLoading(true)
                const response = await promotionService.getActivePromotions({ take: 5 })
                // const response = await promotionService.getAllPromotions()

                if (response && response.data) {
                    const data = response.data?.promotions || response.data || []
                    setPromotions(data)
                }
            } catch (error) {
                console.error('Failed to fetch active promotions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchActivePromotions()
    }, [])

    if (loading) {
        return (
            <div className="promotion-flag-container">
                <Skeleton.Image active style={{ width: '100%', height: 300 }} />
            </div>
        )
    }

    if (promotions.length === 0) {
        return null // Don't show anything if there are no active promotions
    }

    return (
        <div className="promotion-flag-container">
            <Carousel
                autoplay
                autoplaySpeed={5000}
                dots={{ className: 'custom-dots' }}
                arrows
                prevArrow={<div className="carousel-arrow carousel-arrow-left">‹</div>}
                nextArrow={<div className="carousel-arrow carousel-arrow-right">›</div>}
            >
                {promotions.map((promotion) => (
                    <div key={promotion.id}>
                        <div className="promotion-banner"
                             style={{cursor: 'pointer'}}
                             onClick={() => navigate(`/promotion/${promotion.id}`)}
                        >
                            {promotion.image ? (
                                <img
                                    src={promotion.image}
                                    alt={promotion.name}
                                    className="promotion-image"
                                />
                            ) : (
                                <div className="promotion-placeholder">
                                    <div className="promotion-text-content">
                                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                                            {promotion.name}
                                        </Title>
                                        {promotion.description && (
                                            <Text style={{ color: 'white', fontSize: '16px' }}>
                                                {promotion.description}
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            )}
                            {promotion.image && (
                                <div className="promotion-overlay">
                                    <Title level={2} style={{ color: 'white', margin: 0 }}>
                                        {promotion.name}
                                    </Title>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default PromotionFlag
