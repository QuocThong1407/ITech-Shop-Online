import React, { useRef, useState } from "react"
import './ProductGallery.css'
import { Card, Carousel, Image } from "antd"

const ProductGallery = ({ images = [], style = {width: '100%'} }) => {
    const carouselRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const handleCarouselChange = (current) => {
        setCurrentIndex(current)
    }
    const handleThumbnailClick = (index) =>{
        setCurrentIndex(index)
        carouselRef.current.goTo(index)
    }

    return (
        <div className="gallery" style={style}>
            <Card>
                <Carousel 
                    className="gallery__main"
                    ref={carouselRef}
                    dots={false}
                    effect="scrollx"
                    afterChange={handleCarouselChange}
                >
                    {images.map((image, index) => {
                        return (
                            <div key={index}>
                                <Image
                                    src={image}
                                    preview={false}
                                />
                            </div>
                        )
                    })}
                </Carousel>
                <div className="thumbnail-gallery__container">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail__item ${index === currentIndex ? 'selected-thumbnail' : ''}`}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index}`}
                                preview={false}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                            />
                        </div>
                    ))}
                </div>
            </Card>


        </div>
    )
}

export default ProductGallery
