import { useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../AppPages";
import {
    useCreateProductMutation,
    useDeleteProductMutation,
    useGetProductsQuery,
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

function useFormFields(initial) {
    const [fields, setFields] = useState(initial);
    const update = (name) => (event) =>
        setFields((current) => ({ ...current, [name]: event.target.value }));
    return [fields, update];
}


const ProductCreate = () => {
    const { data: products = [], isLoading, isError, refetch, } = useGetProductsQuery();
    const [createProduct, { isLoading: saving, error: saveError }] = useCreateProductMutation();
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

export default ProductCreate;