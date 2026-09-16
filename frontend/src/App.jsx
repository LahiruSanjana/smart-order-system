import { Navigate, Route, Routes } from "react-router-dom";
import { UserRound } from "lucide-react";
import AuthorizedLayout from "./layouts/AuthorizedLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";
import RootLayout from "./layouts/RootLayout";
import { AuthPage, Dashboard, ListingPage } from "./pages/AppPages";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderCreate from "./pages/OrderCreate";
import OrderDetails from "./pages/OrderDetails";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import ProductCreate from "./pages/admin/ProductCreate";
import BranchCreate from "./pages/admin/BranchCreate";
import AdminOrderCreate from "./pages/admin/AdminOrderCreate";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage signup />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/my-orders" element={<CustomerDashboard />} />
          <Route path="/checkout/:productId" element={<OrderCreate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/profile"
            element={
              <ListingPage
                type="Profile"
                description="Manage your account details and preferences."
                icon={UserRound}
              />
            }
          />

          <Route element={<AuthorizedLayout />}>
            <Route path="/orders" element={<AdminOrderCreate />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/products" element={<ProductCreate />} />
            <Route path="/branches" element={<BranchCreate />} />
            <Route path="/customers" element={<AdminCustomersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
