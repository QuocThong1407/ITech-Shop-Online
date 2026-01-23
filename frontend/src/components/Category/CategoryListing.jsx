import { useDispatch } from 'react-redux'
import { setCategories } from '../../redux/actions/categoryAction'
import CategoryList from './CategoryList'
import { useEffect, useState } from 'react'
import { Spin } from 'antd'
import categoryService from "../../services/categoryService.js";

const CategoryListing = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const categories = await categoryService.getAllCategories();
                dispatch(setCategories(categories.data))
            } catch {
                // Failed to load categories
            } finally {
                setLoading(false);
            }
        }
        fetchCategories()
    }, [dispatch])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    return (
        <>
            <CategoryList/>
        </>
    )
}

export default CategoryListing