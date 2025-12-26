import {Outlet} from "react-router-dom";

const CustomerLayout = () => {
    return (
        <>
            <header>
                Customer Header
            </header>
            <main>
                Customer Content
                <Outlet/>
            </main>
            <footer>
                Customer Footer
            </footer>
        </>
    )
}

export default CustomerLayout;