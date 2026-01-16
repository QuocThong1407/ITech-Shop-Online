import Home from "../pages/customer/Home/Home.jsx";
import AdminLayout from "../components/Layouts/AdminLayout/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";
import CustomerLayout from "../components/Layouts/CustomerLayout/CustomerLayout.jsx";
import SellerLayout from "../components/Layouts/SellerLayout/SellerLayout.jsx";
import FilteredProducts from "../pages/customer/FilteredProducts/FilteredProducts.jsx";
import Category from "../pages/seller/Category/Category.jsx";
import AddCategory from "../pages/seller/Category/AddCategory.jsx";
import EditCategory from "../pages/seller/Category/EditCategory.jsx";
import Login from "../pages/public/Login/Login.jsx";
import Register from "../pages/customer/Register/Register.jsx";
import Users from "../pages/admin/Users/Users.jsx";

export const routes = [
    {
        path: '/',
        element: <CustomerLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: '/category/:categoryId',
                element: <FilteredProducts />
            },
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/register",
                element: <Register/>
            },
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout/>,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard/>
            },
            {
                path: 'users',
                element: <Users/>
            }
        ]
    },
    {
        path: '/seller',
        element: <SellerLayout/>,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard/>
            },
            {
                path: "categories",
                element: <Category />
            },
            {
                path: "categories/new",
                element: <AddCategory />
            },
            {
                path: "categories/:id",
                element: <EditCategory />
            },
        ]
    }
]