import { Boxes } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function PublicLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  if (!isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <NavLink className="brand" to="/login">
          <span className="brand-mark">
            <Boxes size={20} />
          </span>
          <span>
            Smart<span>Order</span>
          </span>
        </NavLink>
        <Outlet />
      </div>
    </div>
  );
}
