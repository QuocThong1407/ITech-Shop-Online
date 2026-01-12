import { Link } from "react-router"
import { useSelector } from "react-redux"
import { Button, Card, Space, Image } from 'antd'
import { RightOutlined, LeftOutlined } from '@ant-design/icons'
import './Category.css'
// import { useRef } from "react"

const CategoryList = () => {
    const categories = useSelector(state => state.categories.topCategories)
    
    return (
        <Card title='Categories'>
            <div className="category-list">
                {categories.map(cat => {
                    const {id, image, name} = cat
                    return (
                        <Link key={id} block={"true"} type="default" to={`category/${id}`}>
                            <Button className="category" type="text">
                                <div className="category__image">
                                    <img src={image}/>
                                </div>
                                <div className="category__name">
                                    {name}
                                </div>
                            </Button>
                        </Link>
                    )
                })}
            </div>
        </Card>
    )
}

export default CategoryList