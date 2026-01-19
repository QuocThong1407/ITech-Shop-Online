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
import CustomerProductDetail from "../components/ProductDetail/ProductDetail.jsx";
import Profile from "../components/layouts/Profile/Profile.jsx";
import VerifyEmail from "../pages/public/VerifyEmail/VerifyEmail.jsx";
import AccessRestricted from "../pages/public/AccessRestricted/AccessRestricted.jsx";
import Confirmation from "../pages/customer/Confirmation/Confirmation.jsx";
import Loading from '../pages/customer/Loading/Loading.jsx';
import ProductDetail from "../components/ProductDetail/ProductDetail.jsx";
import Products from "../pages/seller/Products/Products.jsx";
import Promotions from "../pages/admin/Promotions/Promotions.jsx";

export const routes = [
    {
        path: '/',
        element: <CustomerLayout/>,
        children: [
            {
                path: '/',
                element: <Home/>
            },
            {
                path: '/login',
                element: <Login/>,
            },
            {
                path: '/register',
                element: <Register/>,
            },
            {
                path: '/auth/verify',
                element: <VerifyEmail/>,
            },
            {
                path: '/products',
                element: <AllProducts/>
            },
            {
                path: '/search',
                element: <SearchProduct/>
            },
            {
                path: '/product/:productId',
                element: <CustomerProductDetail/>
            },
            {
                path: '/category/:categoryId',
                element: <FilteredProducts/>
            },
            {
                path: '/access-restricted',
                element: <AccessRestricted/>,
            },
            {
                path: '/confirmation',
                element: <Confirmation/>,
            },
            {
                path: '/forgot-password',
                element: <ForgotPassword/>,
            },
            {
                path: '/reset-password',
                element: <ResetPassword/>,
            },
            {
                path: '/cart',
                element: <Cart/>,
            },
            {
                path: '/loading',
                element: <Loading/>,
            },
            {
                path: '/profile',
                element: <Profile/>,
                children: [
                    {
                        index: true,
                        element: <AccountInfo/>
                    },
                    {
                        path: 'my-address',
                        element: <Address/>,
                    },
                    {
                        path: 'membership',
                        element: <Membership/>,
                    },
                    {
                        path: 'my-address/new',
                        element: <AddressEdit/>,
                    },
                    {
                        path: 'my-address/edit/:id',
                        element: <AddressEdit/>,
                    },
                    {
                        path: 'change-password',
                        element: <ChangePassword/>,
                    }
                ]
            },
            {
                path: '/orders',
                element: <Orders/>,
            },
            {
                path: '/orders/:orderId',
                element: <OrderDetail/>,
            },
            {
                path: '/orders/:orderId/review',
                element: <LeaveReview/>,
            },
            {
                path: '/promotion/:id',
                element: <PromotionProducts/>
            }
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
                element: <Category/>
            },
            {
                path: "categories/new",
                element: <AddCategory/>
            },
            {
                path: "categories/:id",
                element: <EditCategory/>
            },
            {
                path: "products",
                element: <Products/>
            }
        ]
    }
]