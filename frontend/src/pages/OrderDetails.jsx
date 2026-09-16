import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";
import {
  useGetBranchQuery,
  useGetOrderQuery,
  useGetProductsQuery,
  useGetUserProfileQuery,
} from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

function getId(value) {
  if (!value) return "";
  return String(value._id || value.id || value);
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <Icon size={17} className="mt-0.5 shrink-0 text-emerald-600" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="mt-1 break-words text-sm">{children}</div>
      </div>
    </div>
  );
}

const OrderDetails = () => {
  const { orderId } = useParams();
  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderQuery(orderId, { skip: !orderId });
  const customerId = getId(order?.customerId);
  const branchId = getId(order?.assignedBranchId);
  const { data: customer } = useGetUserProfileQuery(customerId, {
    skip: !customerId || typeof order?.customerId === "object",
  });
  const { data: branch } = useGetBranchQuery(branchId, {
    skip: !branchId || typeof order?.assignedBranchId === "object",
  });
  const { data: products = [] } = useGetProductsQuery();

  const customerDetails =
    typeof order?.customerId === "object" ? order.customerId : customer;
  const branchDetails =
    typeof order?.assignedBranchId === "object"
      ? order.assignedBranchId
      : branch;
  const productById = new Map(
    products.map((product) => [getId(product), product]),
  );
  const items = order?.items || [];

  if (isLoading) return <div className="panel">Loading order details...</div>;

  if (isError || !order) {
    return (
      <div className="panel flex items-center gap-3 text-rose-600">
        <CircleAlert size={20} />
        <span>We could not load this order. Please try again.</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link
            to="/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
          >
            <ArrowLeft size={16} /> Back to orders
          </Link>
          <div className="eyebrow">Order management</div>
          <h1>Order #{String(orderId).slice(-6)}</h1>
          <p>Review customer, fulfillment, and delivery information.</p>
        </div>
        <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
          {order.status || "UNKNOWN"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="panel">
          <div className="mb-4 flex items-center gap-3">
            <ClipboardList className="text-emerald-600" />
            <div>
              <h2>Order items</h2>
              <p className="text-sm text-slate-500">{items.length} item types</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 pr-3">Product</th>
                  <th className="px-3 py-3">Quantity</th>
                  <th className="px-3 py-3">Unit price</th>
                  <th className="py-3 pl-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr className="border-b last:border-0" key={`${getId(item.productId)}-${index}`}>
                    <td className="py-4 pr-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-emerald-600" />
                        <span>
                          {productById.get(getId(item.productId))?.name ||
                            `Product #${getId(item.productId).slice(-8)}`}
                          {productById.get(getId(item.productId))?.category && (
                            <small className="mt-1 block font-normal text-slate-500">
                              {productById.get(getId(item.productId)).category}
                            </small>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4">{item.quantity}</td>
                    <td className="px-3 py-4">{formatCurrency(item.price)}</td>
                    <td className="py-4 pl-3 text-right font-semibold">
                      {formatCurrency(Number(item.price) * Number(item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
            <div className="text-right">
              <p className="text-sm text-slate-500">Order total</p>
              <strong className="text-2xl text-emerald-600">
                {formatCurrency(order.totalAmount)}
              </strong>
            </div>
          </div>
        </section>

        <div className="grid content-start gap-4">
          <section className="panel">
            <div className="mb-2 flex items-center gap-3">
              <UserRound className="text-emerald-600" />
              <h2>Customer details</h2>
            </div>
            <DetailRow icon={UserRound} label="Name">
              {customerDetails
                ? `${customerDetails.firstName || ""} ${customerDetails.lastName || ""}`.trim() || "Not available"
                : `Customer #${customerId.slice(-8)}`}
            </DetailRow>
            <DetailRow icon={Mail} label="Email">
              {customerDetails?.email || "Not available"}
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              {customerDetails?.phone || "Not available"}
            </DetailRow>
          </section>

          <section className="panel">
            <div className="mb-2 flex items-center gap-3">
              <MapPin className="text-emerald-600" />
              <h2>Branch and delivery</h2>
            </div>
            <DetailRow icon={MapPin} label="Assigned branch">
              {branchDetails?.name || (branchId ? `Branch #${branchId.slice(-8)}` : "Pending allocation")}
            </DetailRow>
            {branchDetails?.address && (
              <DetailRow icon={MapPin} label="Branch address">
                {branchDetails.address}
              </DetailRow>
            )}
            <DetailRow icon={MapPin} label="Delivery address">
              {order.deliveryAddress || "Not available"}
            </DetailRow>
          </section>

          <section className="panel">
            <div className="mb-2 flex items-center gap-3">
              <CalendarDays className="text-emerald-600" />
              <h2>Order timeline</h2>
            </div>
            <DetailRow icon={CalendarDays} label="Created">
              {formatDate(order.createdAt)}
            </DetailRow>
            <DetailRow icon={CalendarDays} label="Last updated">
              {formatDate(order.updatedAt)}
            </DetailRow>
          </section>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;