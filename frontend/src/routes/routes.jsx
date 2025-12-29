
import Home from "../pages/customer/Home/Home.jsx";
import AdminLayout from "../components/Layouts/AdminLayout/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";
import CustomerLayout from "../components/Layouts/CustomerLayout/CustomerLayout.jsx";
import SellerLayout from "../components/Layouts/SellerLayout/SellerLayout.jsx";

export const routes = [
    {
        path: '/',
        element: <CustomerLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
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
        ]
    }
]