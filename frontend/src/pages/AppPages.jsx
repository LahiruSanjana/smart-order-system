import { BarChart3, Boxes, ClipboardList, Package } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLoginMutation, useSignUpMutation } from "../lib/redux/apiSlice";
import { formatCurrency, formatCurrentDate } from "../lib/formatters";

export function PageHeader({ eyebrow, title, description, action }) {
    return (
        <div className="page-header">
            <div>
                <div className="eyebrow">{eyebrow}</div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {action && <button className="primary-button">{action}</button>}
        </div>
    );
}

function Metric({ label, value, change, icon: Icon }) {
    return (
        <div className="metric-card">
            <div className="metric-icon">
                <Icon size={19} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small className="positive">{change} this week</small>
        </div>
    );
}

export function Dashboard() {
    return (
        <>
            <PageHeader
                eyebrow={formatCurrentDate()}
                title="Operations dashboard"
                description="Monitor orders, inventory, branches, and fulfillment activity."
            />
            <div className="metric-grid">
                <Metric label="Orders today" value="128" change="+12.5%" icon={ClipboardList} />
                <Metric label="Revenue" value={formatCurrency(8426)} change="+8.2%" icon={BarChart3} />
                <Metric label="Active products" value="246" change="+4.1%" icon={Package} />
                <Metric label="Fulfillment rate" value="94.8%" change="+2.4%" icon={Boxes} />
            </div>
            <section className="content-grid">
                <div className="panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">Performance</span>
                            <h2>Order activity</h2>
                        </div>
                    </div>
                    <div className="chart-placeholder">
                        <div className="chart-bars">
                            {[42, 61, 48, 76, 58, 88, 72].map((height, index) => (
                                <div className="bar-column" key={index}>
                                    <div className="bar" style={{ height: `${height}%` }} />
                                    <small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">Live feed</span>
                            <h2>Recent orders</h2>
                        </div>
                        <NavLink className="text-link" to="/orders">View all</NavLink>
                    </div>
                    <div className="activity-list">
                        <Activity name="Order #10482" detail="2 items · Processing" amount={formatCurrency(84)} />
                        <Activity name="Order #10481" detail="4 items · Shipped" amount={formatCurrency(126.5)} />
                        <Activity name="Order #10480" detail="1 item · Delivered" amount={formatCurrency(32)} />
                    </div>
                </div>
            </section>
        </>
    );
}

function Activity({ name, detail, amount }) {
    return (
        <div className="activity-row">
            <div className="activity-icon">
                <Package size={16} />
            </div>
            <div>
                <strong>{name}</strong>
                <small>{detail}</small>
            </div>
            <b>{amount}</b>
        </div>
    );
}

export function ListingPage({ type, description, action, icon: Icon }) {
    return (
        <>
            <PageHeader
                eyebrow="Management"
                title={type}
                description={description}
                action={action}
            />
            <div className="empty-panel">
                <div className="empty-icon">
                    <Icon size={26} />
                </div>
                <h2>{type} workspace</h2>
                <p>
                    Connect this view to the SmartOrder API to manage your{" "}
                    {type.toLowerCase()}.
                </p>
                <button className="secondary-button">Get started</button>
            </div>
        </>
    );
}

export function AuthPage({ signup = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [login, loginState] = useLoginMutation();
    const [signUp, signUpState] = useSignUpMutation();
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    });
    const [message, setMessage] = useState("");
    const isSaving = loginState.isLoading || signUpState.isLoading;
    const error = loginState.error || signUpState.error;

    async function submit(event) {
        event.preventDefault();
        setMessage("");
        const redirectTo = location.state?.redirectTo || "/";

        try {
            if (signup) {
                const signUpResult = await signUp({ ...form, role: "CUSTOMER" }).unwrap();
                if (signUpResult?.token) {
                    localStorage.setItem("token", signUpResult.token);
                    localStorage.setItem("user", JSON.stringify(signUpResult.user));
                    navigate(redirectTo, { replace: true });
                    return;
                }

                setMessage("Account created successfully! Redirecting to login...");

                setTimeout(() => {
                    navigate("/login", { state: { redirectTo } });
                }, 1000);
                return;
            }

            const result = await login({
                email: form.email,
                password: form.password,
            }).unwrap();

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            navigate(redirectTo, { replace: true });
        } catch {
            setMessage("We could not complete that request. Please check your credentials.");
        }
    }

    return (
        <div className="auth-card">
            <div className="eyebrow">SmartOrder workspace</div>
            <h1>{signup ? "Create your account" : "Welcome back"}</h1>
            <p>
                {signup
                    ? "Set up your account to start managing orders."
                    : "Sign in to manage your order network."}
            </p>
            <form onSubmit={submit}>
                <label>
                    {signup ? "First name" : "Email"}
                    <input
                        required
                        type={signup ? "text" : "email"}
                        value={signup ? form.firstName : form.email}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                [signup ? "firstName" : "email"]: event.target.value,
                            })
                        }
                        placeholder={signup ? "First name" : "you@company.com"}
                    />
                </label>
                {signup && (
                    <label>
                        Last name
                        <input
                            required
                            value={form.lastName}
                            onChange={(event) =>
                                setForm({ ...form, lastName: event.target.value })
                            }
                            placeholder="Last name"
                        />
                    </label>
                )}
                {signup && (
                    <label>
                        Email
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm({ ...form, email: event.target.value })
                            }
                            placeholder="you@company.com"
                        />
                    </label>
                )}
                <label>
                    Password
                    <input
                        required
                        minLength={6}
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                            setForm({ ...form, password: event.target.value })
                        }
                        placeholder="Password"
                    />
                </label>
                <button className="primary-button" type="submit">
                    {isSaving ? "Please wait..." : signup ? "Create account" : "Sign in"}
                </button>
            </form>
            {(error || message) && (
                <p
                    className={
                        error
                            ? "mt-4 text-sm text-rose-600"
                            : "mt-4 text-sm text-emerald-700"
                    }
                >
                    {error?.data?.message || error?.error || message}
                </p>
            )}
            <p className="auth-switch">
                {signup ? "Already have an account?" : "New to SmartOrder?"}{" "}
                {/* NavLink හරහා මාරු වන විටත් redirectTo ස්ටේට් එක මඟහැරී නොයා ආරක්ෂා කර ඇත */}
                <NavLink
                    to={signup ? "/login" : "/signup"}
                    state={{ redirectTo: location.state?.redirectTo }}
                >
                    {signup ? "Sign in" : "Create an account"}
                </NavLink>
            </p>
        </div>
    );
}
