import {Link, Outlet} from "@tanstack/react-router";

const Layout = () => {
    return (
        <div className='browser'>
            <header className='header'>
                <Link to="/" className="brand">
                    <span className="brand-mark">SKG</span>
                    <span>OSTrails CLARIN browser</span>
                </Link>
            </header>
            <main className='main'>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout