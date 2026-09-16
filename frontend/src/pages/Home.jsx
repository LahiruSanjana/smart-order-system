import {
    AlertTriangle,
    LogOut,
    RefreshCw,
    Sparkles,
    WifiOff,
    ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useGetProductsQuery } from "../lib/redux/apiSlice";
import { formatCurrency } from "../lib/formatters";

const Home = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        Boolean(localStorage.getItem("token")),
    );
    const {
        data: products,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetProductsQuery();

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        navigate("/");
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div
                    className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full space-y-4"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className="flex justify-center items-center space-x-2"
                        aria-hidden="true"
                    >
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        Smart Order Store
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                        Getting the store ready
                    </h1>
                    <p className="text-slate-400 text-sm">
                        We are bringing the latest products to you.
                    </p>
                </div>
            </main>
        );
    }

    if (isError) {
        const errorMessage =
            error?.data?.message ||
            error?.error ||
            "The product service is not responding right now.";

        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div
                    className="bg-slate-800/80 backdrop-blur-md border border-rose-500/20 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full space-y-4"
                    role="alert"
                >
                    <div
                        className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20"
                        aria-hidden="true"
                    >
                        <WifiOff size={28} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">
                        Connection issue
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                        We could not load the store
                    </h1>
                    <p className="text-slate-400 text-sm">{errorMessage}</p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                        <Button
                            variant="secondary"
                            onClick={refetch}
                            className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-0"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </Button>
                        <button
                            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 py-2 transition-colors"
                            onClick={() => navigate("/login")}
                        >
                            Continue to sign in
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const productList = Array.isArray(products)
        ? products
        : products?.products || [];

    return (
        <div className="home-page min-h-screen flex flex-col font-sans">
            {/* Header / Navbar Section */}
            <header className="bg-[#17231f] text-white pt-24 pb-16 px-6 sm:px-12 lg:px-20 shadow-xl relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Navbar */}
                <nav
                    className="absolute inset-x-0 top-0 flex items-center justify-between px-6 sm:px-12 lg:px-20 py-5 bg-[#17231f]/90 backdrop-blur-md border-b border-white/10 z-20"
                    aria-label="Store navigation"
                >
                    <button
                        className="flex items-center gap-2.5 text-lg font-bold text-white"
                        onClick={() => navigate("/")}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md">
                            <ShoppingBag size={18} />
                        </span>
                        Smart<span className="text-emerald-400">Order</span>
                    </button>
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-sm text-slate-300 hover:bg-white/10 hover:text-white"
                                    onClick={() => navigate("/my-orders")}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="rounded-lg border-0 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                                    onClick={handleSignOut}
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-sm text-slate-300 hover:bg-white/10 hover:text-white"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign in
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="rounded-lg border-0 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                                    onClick={() => navigate("/signup")}
                                >
                                    Sign up
                                </Button>
                            </>
                        )}
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10 mt-6">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/20">
                            <Sparkles size={14} />
                            <span>Smart Order Store</span>
                            {isFetching && (
                                <span className="flex items-center gap-1.5 text-slate-300 ml-2 normal-case font-normal border-l border-slate-600 pl-2">
                                    <RefreshCw
                                        size={12}
                                        className="animate-spin text-emerald-400"
                                    />{" "}
                                    Updating...
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Intelligent Routing &{" "}
                            <span className="text-emerald-400">Seamless Products</span>
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                            Explore our latest inventory items managed by real-time branch
                            allocation and smart logistics networks.
                        </p>
                    </div>
                </div>
            </header>

            {/* Products Section */}
            <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-16 w-full">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="text-emerald-600" size={24} />
                            Featured Products
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Showing available stock items from our system inventory.
                        </p>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                        {productList.length} Items Listed
                    </span>
                </div>

                {productList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm space-y-3">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            No Products Found
                        </h3>
                        <p className="text-slate-500 text-sm">
                            There are no products available in the store yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productList.slice(0, 6).map((product) => (
                            <article
                                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
                                key={product.id || product._id}
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                    navigate(`/products/${product.id || product._id}`)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ")
                                        navigate(`/products/${product.id || product._id}`);
                                }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="space-y-3">
                                    <div>
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-60 object-cover rounded-xl" />
                                    </div>
                                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                        {product.category || "Product"}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xl font-extrabold text-slate-900">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        In Stock
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-slate-500 text-sm">
                <p>© 2026 Smart Order Allocation System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;