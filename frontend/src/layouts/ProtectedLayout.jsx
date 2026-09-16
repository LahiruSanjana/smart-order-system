import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Boxes, ChevronRight, ClipboardList, LayoutDashboard, MapPin, Package, UsersRound } from "lucide-react";

const adminNavigation = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Orders", to: "/orders", icon: ClipboardList },
    { label: "Products", to: "/products", icon: Package },
    { label: "Branches", to: "/branches", icon: MapPin },
    { label: "Customers", to: "/customers", icon: UsersRound },
];

function getStoredUser() {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

function hasSession() { return Boolean(localStorage.getItem("token")); }

export default function ProtectedLayout() {
    const location = useLocation();
    const user = getStoredUser();

    if (!hasSession()) {
        return <Navigate replace to="/login" state={{ redirectTo: location.pathname }} />;
    }
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <NavLink className="brand-container" to="/">
                        <Boxes size={24} />
                        <span>Smart<span>Order</span></span>
                </NavLink>
                <div className="sidebar-label">Admin Workspace</div>
                <nav className="main-nav">
                    {adminNavigation.map(({ label, to, icon: Icon }) => (
                        <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumbs">
                        <span>Admin Panel</span>
                        <ChevronRight size={15} />
                        <strong>Overview</strong>
                    </div>
                </header>
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}