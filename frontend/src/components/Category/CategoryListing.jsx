import { useDispatch } from 'react-redux'
import { setCategories } from '../../redux/actions/categoryAction'
import CategoryList from './CategoryList'
import { useEffect } from 'react'
import categoryService from "../../services/categoryService.js";

const CategoryListing = () => {
    const dispatch = useDispatch();

    // const path = 'https://fakestoreapi.com/products/categories'
    // const path = 'https://api.escuelajs.co/api/v1/categories'

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getAllCategories();
                dispatch(setCategories(categories.data))
            }
            catch(error) {
                console.error(error)
            }
        }
        fetchCategories()
    }, [])

    return (
        <>
            <CategoryList/>
        </>
    )
}

export default CategoryListing