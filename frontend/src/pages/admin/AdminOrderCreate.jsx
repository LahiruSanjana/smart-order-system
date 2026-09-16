import { useState } from "react";
import { RefreshCw, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../AppPages";
import {
    useGetBranchesQuery,
    useGetOrdersQuery,
    useUpdateOrderMutation,
} from "../../lib/redux/apiSlice";
import { formatCurrency } from "../../lib/formatters";

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

const AdminOrderCreate = () => {
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

export default AdminOrderCreate;