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
import ForgotPassword from "../pages/customer/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../pages/public/ResetPassword/ResetPassword.jsx";
import Address from "../pages/customer/Address/Address.jsx";
import AddressEdit from "../pages/customer/Address/AddressEdit.jsx";
import ChangePassword from "../pages/customer/ChangePassword/ChangePassword.jsx";
import Cart from "../pages/customer/Cart/Cart.jsx";
import Membership from "../pages/customer/Membership/Membership.jsx";
import AllProducts from "../pages/customer/AllProducts/AllProducts.jsx";
import SearchProduct from "../pages/customer/SearchProduct/SearchProduct.jsx";
import PromotionProducts from "../pages/customer/PromotionProducts/PromotionProducts.jsx";
// import Orders from "../pages/customer/Orders/Orders.jsx";
// import OrderDetail from "../pages/customer/Orders/OrderDetail.jsx";
// import LeaveReview from "../pages/customer/Orders/LeaveReview.jsx";
import AccountInfo from "../pages/customer/AccountInfo/AccountInfo.jsx";
import ProductDetail from "../components/ProductDetail/ProductDetail.jsx";
import Products from "../pages/seller/Products/Products.jsx";
import Promotions from "../pages/admin/Promotions/Promotions.jsx";

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
            {
                path: "/forgot-password",
                element: <ForgotPassword/>
            },
            {
                path: "/reset-password",
                element: <ResetPassword/>
            },
            {
                path: "/profile/my-address",
                element: <Address/>
            },
            {
                path: "/profile/my-address/new",
                element: <AddressEdit/>
            },
            {
                path: "/profile/my-address/edit/:id",
                element: <AddressEdit/>
            },
            {
                path: "/profile/change-password",
                element: <ChangePassword/>
            },
            {
                path: "/cart",
                element: <Cart/>
            },
            {
                path: "/profile/membership",
                element: <Membership/>
            },
            {
                path: "/products",
                element: <AllProducts/>
            },
            {
                path: "/product/:productId",
                element: <ProductDetail/>
            },
            {
                path: "/search",
                element: <SearchProduct/>
            },
            {
                path: "/promotion/:id",
                element: <PromotionProducts/>
            },
            // {
            //     path: "/orders",
            //     element: <Orders/>
            // },
            // {
            //     path: "/orders/:orderId",
            //     element: <OrderDetail/>
            // },
            // {
            //     path: "/orders/:orderId/review",
            //     element: <LeaveReview/>
            // },
            {
                path: "/profile/account-info",
                element: <AccountInfo/>
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
            },
            {
                path: 'promotions',
                element: <Promotions/>
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
            {
                path: "products",
                element: <Products/>
            }
        ]
    }
]