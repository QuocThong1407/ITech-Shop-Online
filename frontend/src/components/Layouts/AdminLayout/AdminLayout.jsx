import {Outlet} from "react-router-dom";

const AdminLayout = () => {
    return (
        <>
            <header>
                Admin Header
            </header>
            <main>
                Admin Content
                <Outlet/>
            </main>
            <footer>
                Admin Footer
            </footer>
        </>
    )
}

export default AdminLayout;