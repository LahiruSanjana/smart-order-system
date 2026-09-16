import { Navigate, Route, Routes } from "react-router-dom";
import { UserRound } from "lucide-react";
import AuthorizedLayout from "./layouts/AuthorizedLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";
import RootLayout from "./layouts/RootLayout";
import { AuthPage, Dashboard, ListingPage } from "./pages/AppPages";
import {
  AdminBranches,
  AdminOrders,
  AdminProducts,
  CustomersPage,
} from "./pages/AdminPages";
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderCreate from "./pages/OrderCreate";
import OrderDetails from "./pages/OrderDetails";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";

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
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/branches" element={<AdminBranches />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
