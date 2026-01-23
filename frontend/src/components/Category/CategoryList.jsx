import { Link } from "react-router"
import { useSelector } from "react-redux"
import { Button, Card, Space, Image, Typography } from 'antd'
import { RightOutlined, LeftOutlined } from '@ant-design/icons'
import './Category.css'
// import { useRef } from "react"

const CategoryList = () => {
    const categories = useSelector(state => state.categories.allCategories)
    
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
                                <Typography.Text ellipsis={{ tooltip: true }}>
                                    {name}
                                </Typography.Text>
                            </Button>
                        </Link>
                    )
                })}
            </div>
        </Card>
    )
}

export default CategoryList