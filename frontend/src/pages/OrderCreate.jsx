import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import DeliveryMap from "../components/DeliveryMap";
import {
  useCreateOrderMutation,
  useGetProductQuery,
} from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function OrderCreate() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const { data: product, isLoading } = useGetProductQuery(productId);
  const [createOrder, { isLoading: isSaving, error }] =
    useCreateOrderMutation();
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!user?.id || !location) return;
    try {
      await createOrder({
        customerId: user.id,
        items: [
          {
            productId,
            quantity: Number(quantity),
            price: Number(product.price),
          },
        ],
        totalAmount: Number(product.price) * Number(quantity),
        deliveryAddress: address,
        deliveryLocation: location,
      }).unwrap();
      setSuccess(true);
    } catch {
      return;
    }
  }

  if (isLoading)
    return (
      <main className="page-content">
        <div className="panel">Loading checkout...</div>
      </main>
    );
  if (!product)
    return (
      <main className="page-content">
        <div className="panel">Product not found.</div>
      </main>
    );
  if (success)
    return (
      <main className="home-state-shell">
        <div className="home-state-card">
          <CheckCircle2 className="mx-auto text-emerald-600" size={52} />
          <h1>Order placed</h1>
          <p className="home-state-message">
            Your order was created and branch allocation is in progress.
          </p>
          <Button className="mt-6" onClick={() => navigate("/my-orders")}>
            Track my order
          </Button>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Deliver {product.name}
          </h1>
        </div>
        <form
          onSubmit={submit}
          className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"
        >
          <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Order details</h2>
            <div className="flex justify-between border-b pb-4">
              <span>{product.name}</span>
                            <strong>{formatCurrency(product.price)}</strong>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Quantity
              <input
                min="1"
                max={product.stock}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="rounded-lg border border-slate-200 p-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Delivery address
              <textarea
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="min-h-28 rounded-lg border border-slate-200 p-3"
                placeholder="Street, city, postal code"
              />
            </label>
            <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              <MapPin size={16} className="mb-1" /> Click the map to select your
              delivery location.
            </div>
            {error && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error?.data?.message || "Could not place this order."}
              </p>
            )}
            <Button
              disabled={isSaving || !location}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {isSaving
                ? "Placing order..."
                : `Place order · ${formatCurrency(Number(product.price) * Number(quantity))}`}
            </Button>
          </section>
          <section>
            <DeliveryMap value={location} onChange={setLocation} />
            {location && (
              <p className="mt-3 text-sm text-slate-500">
                Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
