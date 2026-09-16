import { ArrowLeft, MapPin, ShoppingCart, Sparkles } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useGetProductQuery } from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

function getProductId(product) {
    return product?.id || product?._id;
}

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const {
        data: product,
        isLoading,
        isError,
        refetch,
    } = useGetProductQuery(productId);

    if (isLoading)
        return (
            <main className="home-state-shell">
                <div className="home-state-card" role="status">
                    <div className="spring-loader">
                        <span />
                        <span />
                        <span />
                    </div>
                    <h1>Loading product</h1>
                    <p className="home-state-message">
                        We are fetching the latest product details.
                    </p>
                </div>
            </main>
        );
    if (isError || !product)
        return (
            <main className="home-state-shell">
                <div className="home-state-card error-state">
                    <h1>Product unavailable</h1>
                    <p className="home-state-message">
                        This product could not be loaded.
                    </p>
                    <div className="home-state-actions">
                        <Button onClick={refetch}>Try again</Button>
                        <Button variant="outline" onClick={() => navigate("/")}>
                            Back to store
                        </Button>
                    </div>
                </div>
            </main>
        );

    const handleBuyProduct = (product) => {
        const token = localStorage.getItem("token");
        const targetId = getProductId(product);

        if (!token) {
            navigate("/signup", { state: { redirectTo: `/checkout/${targetId}` } });
        } else {
            navigate(`/checkout/${targetId}`);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                >
                    <ArrowLeft size={16} /> Back to products
                </Link>
                <div className="grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
                    <div className="flex min-h-80 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="max-h-80 w-full rounded-xl object-cover"
                            />
                        ) : (
                            <ShoppingCart size={80} strokeWidth={1} />
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
                            {product.category || "Product"}
                        </span>
                        <h1 className="text-4xl font-bold text-slate-900">
                            {product.name}
                        </h1>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                            <strong className="text-3xl text-slate-900">
                                {formatCurrency(product.price)}
                            </strong>
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <MapPin size={15} /> {product.stock} available
                            </span>
                        </div>
                        <Button
                            onClick={() => handleBuyProduct(product)}
                            className="mt-7 h-12 bg-emerald-700 px-6 hover:bg-emerald-800"
                        >
                            Buy this product <ShoppingCart size={17} />
                        </Button>
                    </div>
                </div>
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Sparkles size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                Product overview
                            </p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                About this product
                            </h2>
                            <div className="mt-4 h-1 w-12 rounded-full bg-emerald-500" />
                            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-600">
                                {product.description ||
                                    "This product is carefully selected and ready to order from our SmartOrder store."}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

