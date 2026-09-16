import { Navigate, Outlet, useLocation } from "react-router-dom";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function AuthorizedLayout({
  allowedRoles = ["ADMIN", "SUPER_ADMIN"],
}) {
  const location = useLocation();
  const user = getStoredUser();
  if (!user || !allowedRoles.includes(user.role))
    return <Navigate replace to="/dashboard" state={{ from: location }} />;
  return <Outlet />;
}
