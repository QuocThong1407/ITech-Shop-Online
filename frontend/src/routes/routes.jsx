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
import Orders from "../pages/customer/Orders/Orders.jsx";
import OrderDetail from "../pages/customer/Orders/OrderDetail.jsx";
import LeaveReview from "../pages/customer/Orders/LeaveReview.jsx";
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
import Coupons from "../pages/admin/Coupons/Coupons.jsx";
import Returns from "../pages/seller/Returns/Returns.jsx";
import Cancellations from "../pages/seller/Cancellations/Cancellations.jsx";
import SellerOrders from "../pages/seller/Orders/Orders.jsx";
import Categories from "../pages/admin/Categories/Categories.jsx";
import RevenueReport from "../pages/admin/RevenueReport/RevenueReport.jsx";
import ActivityReport from "../pages/admin/ActivityReport/ActivityReport.jsx";
import AdminProducts from "../pages/admin/Products/Products.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import {Navigate} from "react-router";

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
                path: '/verify-email',
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
        element:
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout/>
            </ProtectedRoute> ,
        children: [
            {
                index: true,
                element: <Navigate to='dashboard' replace/>
            },
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
            },
            {
                path: 'coupons',
                element: <Coupons/>
            },
            {
                path: "categories",
                element: <Categories/>
            },
            {
                path: 'reports/revenues',
                element: <RevenueReport/>
            },
            {
                path: 'reports/activities',
                element: <ActivityReport/>
            },
            {
                path: 'products',
                element: <AdminProducts/>
            }
        ]
    },
    {
        path: '/seller',
        element:
            <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerLayout/>
            </ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to='orders' replace/>
            },
            {
                path: 'orders',
                element: <SellerOrders/>
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
            },
            {
                path: 'returns',
                element: <Returns/>
            },
            {
                path: 'cancellations',
                element: <Cancellations/>
            },
        ]
    }
]