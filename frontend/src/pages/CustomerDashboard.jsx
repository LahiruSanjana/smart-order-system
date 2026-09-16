import { Link } from "react-router-dom";
import { ClipboardList, MapPin, UserRound } from "lucide-react";
import { useGetOrdersByCustomerQuery } from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function CustomerDashboard() {
  const user = getUser();
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useGetOrdersByCustomerQuery(user?.id, { skip: !user?.id });
  return (
    <>
      <div className="page-header bg-emerald-950">
        <div className="page-header-content px-16 py-8">
          <h1>My orders</h1>
          <div className="eyebrow">Customer workspace</div>
          <p>Track your orders and delivery progress.</p>
        </div>
        <div className="page-header-actions px-16 py-8">
          <Link className="primary-button" to="/">
            Shop products
          </Link>
        </div>
      </div>
      {isLoading && <div className="panel">Loading your orders...</div>}
      {isError && (
        <div className="panel">
          We could not load your orders. Please refresh and try again.
        </div>
      )}
      {!isLoading && !isError && (
        <div className="panel mx-8">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardList className="text-emerald-700" />
            <h2>Order history</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-slate-500">You have not placed an order yet.</p>
          ) : (
            <div className="grid gap-3">
              {orders.map((order) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4"
                  key={order._id || order.id}
                >
                  <div>
                    <strong>
                      Order #{String(order._id || order.id).slice(-6)}
                    </strong>
                    <p className="text-sm text-slate-500">
                      {order.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {order.status}
                    </span>
                    <p className="mt-2 font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-5 mx-8 grid gap-4 sm:grid-cols-2">
        <div className="panel">
          <UserRound className="text-emerald-700" />
          <h2 className="mt-3">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            {user?.email || "Manage your account details."}
          </p>
        </div>
        <div className="panel">
          <MapPin className="text-emerald-700" />
          <h2 className="mt-3">Delivery locations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Every order can use a fresh map location.
          </p>
        </div>
      </div>
    </>
  );
}
