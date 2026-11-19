import {Link, Outlet} from "@tanstack/react-router";
import {ENTITIES} from "../entities.ts";

const Layout = () => {
    return (
        <div className='browser'>
            <header className='header'>
                <Link to="/" className="brand">
                    <span className="brand-mark">SKG</span>
                    <span>OSTrails CLARIN browser</span>
                </Link>
                <nav className="nav">
                    {ENTITIES.map((e) => (
                        <Link
                            key={e.path}
                            to="/$entity"
                            params={{ entity: e.path }}
                            className="tab"
                            activeProps={{ className: 'tab active' }}
                            activeOptions={{ includeSearch: false }}>
                            {e.label}
                        </Link>
                    ))}
                </nav>
            </header>
            <main className='main'>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout