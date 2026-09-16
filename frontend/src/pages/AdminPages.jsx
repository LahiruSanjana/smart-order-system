import { useState } from "react";
import { Plus, RefreshCw, Search, Trash2, UsersRound, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PageHeader } from "./AppPages";
import {
  useCreateBranchMutation,
  useCreateProductMutation,
  useDeleteBranchMutation,
  useDeleteProductMutation,
  useGetBranchesQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useUpdateOrderMutation,
} from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

function ErrorState({ message, onRetry }) {
  return (
    <div className="panel flex items-center justify-between gap-4 text-rose-700">
      <span>{message}</span>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw size={15} /> Retry
      </Button>
    </div>
  );
}

function useFormFields(initial) {
  const [fields, setFields] = useState(initial);
  const update = (name) => (event) =>
    setFields((current) => ({ ...current, [name]: event.target.value }));
  return [fields, update];
}

export function AdminBranches() {
  const {
    data: branches = [],
    isLoading,
    isError,
    refetch,
  } = useGetBranchesQuery();
  const [createBranch, { isLoading: saving }] = useCreateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [fields, update] = useFormFields({
    name: "",
    code: "",
    address: "",
    maxCapacity: "100",
  });
  const [open, setOpen] = useState(false);
  async function submit(event) {
    event.preventDefault();
    await createBranch({
      ...fields,
      maxCapacity: Number(fields.maxCapacity),
    }).unwrap();
    setOpen(false);
  }
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Branches"
        description="Monitor branch capacity, workload, and delivery coverage."
        action={null}
      />
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => setOpen(!open)}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <Plus size={16} /> Add branch
        </Button>
      </div>
      {open && (
        <form
          onSubmit={submit}
          className="panel mb-5 grid gap-3 sm:grid-cols-2"
        >
          <input
            required
            placeholder="Branch name"
            value={fields.name}
            onChange={update("name")}
            className="rounded-lg border p-3"
          />
          <input
            required
            placeholder="Code"
            value={fields.code}
            onChange={update("code")}
            className="rounded-lg border p-3"
          />
          <input
            required
            placeholder="Address"
            value={fields.address}
            onChange={update("address")}
            className="rounded-lg border p-3 sm:col-span-2"
          />
          <input
            required
            type="number"
            placeholder="Max capacity"
            value={fields.maxCapacity}
            onChange={update("maxCapacity")}
            className="rounded-lg border p-3"
          />
          <Button disabled={saving} type="submit">
            {saving ? "Saving..." : "Save branch"}
          </Button>
        </form>
      )}
      {isLoading && <div className="panel">Loading branches...</div>}
      {isError && (
        <ErrorState message="Could not load branches." onRetry={refetch} />
      )}
      {!isLoading && !isError && (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <div className="panel" key={branch._id || branch.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h2>{branch.name}</h2>
                  <p className="text-sm text-slate-500">
                    {branch.code} · {branch.address}
                  </p>
                </div>
                <button
                  className="text-rose-600"
                  aria-label={`Delete ${branch.name}`}
                  onClick={() => deleteBranch(branch._id || branch.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-6 flex justify-between text-sm">
                <span>
                  Workload <strong>{branch.currentWorkload || 0}</strong>
                </span>
                <span>
                  Capacity <strong>{branch.maxCapacity || 0}</strong>
                </span>
                <span>{branch.isActive === false ? "Inactive" : "Active"}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{
                    width: `${Math.min(100, ((branch.currentWorkload || 0) / (branch.maxCapacity || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function AdminProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery();
  const [createProduct, { isLoading: saving, error: saveError }] =
    useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [fields, update] = useFormFields({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [open, setOpen] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const productData = {
      ...fields,
      price: Number(fields.price),
      stock: Number(fields.stock),
    };

    if (!productData.imageUrl) {
      delete productData.imageUrl;
    }

    await createProduct(productData).unwrap();
    setOpen(false);
  }
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Products"
        description="Manage catalog items, pricing, and inventory."
      />
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => setOpen(!open)}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <Plus size={16} /> Add product
        </Button>
      </div>
      {open && (
        <form
          onSubmit={submit}
          className="panel mb-5 grid gap-3 sm:grid-cols-2"
        >
          <input
            required
            placeholder="Product name"
            value={fields.name}
            onChange={update("name")}
            className="rounded-lg border p-3 text-slate-700 bg-slate-200"
          />
          <input
            required
            placeholder="Category"
            value={fields.category}
            onChange={update("category")}
            className="rounded-lg border p-3 text-slate-700 bg-slate-200"
          />
          <textarea
            required
            placeholder="Description"
            value={fields.description}
            onChange={update("description")}
            className="rounded-lg border p-3 sm:col-span-2 text-slate-700 bg-slate-200"
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={fields.imageUrl}
            onChange={update("imageUrl")}
            className="rounded-lg border p-3 sm:col-span-2 text-slate-700 bg-slate-200"
          />
          <input
            required
            min="0"
            step="0.01"
            type="number"
            placeholder="Price"
            value={fields.price}
            onChange={update("price")}
            className="rounded-lg border p-3 text-slate-700 bg-slate-200"
          />
          <input
            required
            min="0"
            type="number"
            placeholder="Stock"
            value={fields.stock}
            onChange={update("stock")}
            className="rounded-lg border p-3 text-slate-700 bg-slate-200"
          />
          {saveError && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">
              {saveError.data?.message || "Could not save the product."}
            </p>
          )}
          <Button disabled={saving} type="submit" >
            {saving ? "Saving..." : "Save product"}
          </Button>
        </form>
      )}
      {isLoading && <div className="panel">Loading products...</div>}
      {isError && (
        <ErrorState message="Could not load products." onRetry={refetch} />
      )}
      {!isLoading && !isError && (
        <div className="panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  className="border-b last:border-0"
                  key={product._id || product.id}
                >
                  <td className="p-3 font-semibold">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{formatCurrency(product.price)}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3 text-right">
                    <button
                      className="text-rose-600"
                      onClick={() => deleteProduct(product._id || product.id)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useGetOrdersQuery();
  const { data: branches = [] } = useGetBranchesQuery();
  const [updateOrder] = useUpdateOrderMutation();
  const branchNames = new Map(
    branches.map((branch) => [String(branch._id || branch.id), branch.name]),
  );
  const filteredOrders = orders.filter((order) => {
    const orderId = String(order._id || order.id || "").toLowerCase();
    const customerId = String(order.customerId || "").toLowerCase();
    const branchId = String(order.assignedBranchId?._id || order.assignedBranchId || "");
    const branchName = String(
      order.assignedBranchId?.name || branchNames.get(branchId) || "",
    ).toLowerCase();
    const status = String(order.status || "").toLowerCase();
    const query = searchTerm.trim().toLowerCase();

    return !query || [orderId, customerId, branchName, status].some((value) => value.includes(query));
  });

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Orders"
        description="Review orders and move fulfillment statuses forward."
      />
      {isLoading && <div className="panel">Loading orders...</div>}
      {isError && (
        <ErrorState message="Could not load orders." onRetry={refetch} />
      )}
      {!isLoading && !isError && (
        <div className="panel overflow-x-auto">
          <div className="relative mb-5 max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search order, customer, branch, or status"
              aria-label="Search orders"
              className="w-full text-black rounded-lg border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  className="border-b last:border-0"
                  key={order._id || order.id}
                >
                  <td className="p-3 font-semibold">
                    #{String(order._id || order.id).slice(-6)}
                  </td>
                  <td className="p-3">{String(order.customerId).slice(-8)}</td>
                  <td className="p-3">
                    {order.assignedBranchId?._id || order.assignedBranchId
                      ? order.assignedBranchId?.name ||
                        branchNames.get(
                          String(order.assignedBranchId?._id || order.assignedBranchId),
                        ) ||
                        "Branch unavailable"
                      : "Pending allocation"}
                  </td>
                  <td className="p-3">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrder({
                          orderId: order._id || order.id,
                          status: event.target.value,
                        })
                      }
                      className="rounded border p-2"
                    >
                      <option>PENDING</option>
                      <option>PROCESSING</option>
                      <option>SHIPPED</option>
                      <option>DELIVERED</option>
                      <option>CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-3 text-left">   
                    <button
                      type="button"
                      aria-label={`View order ${String(order._id || order.id).slice(-6)}`}
                      onClick={() =>
                        navigate(`/orders/${order._id || order.id}`)
                      }
                    >    
                       <Eye size={16} />
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function CustomersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Customers"
        description="Customer management is ready for the user directory endpoint."
      />
      <div className="panel text-center">
        <UsersRound className="mx-auto text-emerald-700" size={34} />
        <h2 className="mt-4">User directory endpoint required</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          The current backend exposes profile-by-id, signup, login, and delete
          routes, but does not expose GET /users. Add that endpoint to populate
          this page with customer records.
        </p>
      </div>
    </>
  );
}
