import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const activeStatuses = [
  "PENDING",
  "ACCEPTED_BY_LAUNDRY",
  "PICKED_UP",
  "WASHING",
  "READY_FOR_DELIVERY",
  "DELIVERED",
];

const statusStyles = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  ACCEPTED_BY_LAUNDRY: "border-sky-400/30 bg-sky-500/10 text-sky-200",
  PICKED_UP: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  WASHING: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  READY_FOR_DELIVERY: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  DELIVERED: "border-teal-400/30 bg-teal-500/10 text-teal-200",
  COMPLETED: "border-lime-400/30 bg-lime-500/10 text-lime-200",
  CANCELLED: "border-red-400/30 bg-red-500/10 text-red-200",
  REJECTED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

const paymentStyles = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PAID: "border-lime-400/30 bg-lime-500/10 text-lime-200",
  FAILED: "border-red-400/30 bg-red-500/10 text-red-200",
  REFUNDED: "border-slate-400/30 bg-slate-500/10 text-slate-200",
};

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/orders/my-orders");
        const baseOrders = response.data?.orders || [];

        const ordersWithPayments = await Promise.all(
          baseOrders.map(async (order) => {
            try {
              const paymentResponse = await apiClient.get(
                `/payments/order/${order.id}`
              );

              return {
                ...order,
                payment: paymentResponse.data?.payment || null,
              };
            } catch (paymentError) {
              if (paymentError.response?.status === 404) {
                return {
                  ...order,
                  payment: null,
                };
              }

              throw paymentError;
            }
          })
        );

        if (isMounted) {
          setOrders(ordersWithPayments);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError(getApiErrorMessage(fetchError, "Unable to load your orders right now."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) =>
    activeStatuses.includes(order?.status)
  ).length;
  const completedOrders = orders.filter(
    (order) => order?.status === "COMPLETED"
  ).length;
  const pendingPayments = orders.filter(
    (order) => order?.paymentStatus !== "PAID"
  ).length;

  const summaryCards = [
    {
      label: "Total Orders",
      value: totalOrders,
      tone: "text-aqua",
    },
    {
      label: "Active Orders",
      value: activeOrders,
      tone: "text-cyan-200",
    },
    {
      label: "Completed Orders",
      value: completedOrders,
      tone: "text-lime",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      tone: "text-coral",
    },
  ];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Customer"
        title="Stay on top of pickups, payments, and recent activity."
        description="Use this overview dashboard to monitor your latest laundry activity, jump into order history, and quickly start a new booking."
        actions={
          <>
            <Link to="/" className="btn-primary w-full sm:w-auto">
              Find Laundry
            </Link>
            <Link to="/customer/orders" className="btn-secondary w-full sm:w-auto">
              View All Orders
            </Link>
          </>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Live dashboard metric based on your current order history.
            </p>
          </div>
        ))}
      </section>

      {loading ? (
        <section className="grid gap-6 lg:grid-cols-2" aria-label="Loading dashboard orders">
          {[1, 2].map((card) => (
            <div key={card} className="panel p-6">
              <div className="skeleton h-6 w-1/3" />
              <div className="mt-4 skeleton h-8 w-2/3" />
              <div className="mt-4 space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="empty-state">
          <div className="text-3xl">📦</div>
          <p className="mt-3 font-medium text-white">No orders yet</p>
          <p className="mt-2">
            Start from the home page, pick a laundry, and place your first
            PressGo order.
          </p>
          <Link to="/" className="btn-primary mt-5 w-full sm:w-auto">
            Find Laundry
          </Link>
        </section>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Recent Orders
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Latest Customer Activity
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Your five most recent orders are listed here for quick access.
              </p>
            </div>

            <Link to="/customer/orders" className="btn-secondary w-full sm:w-auto">
              See Full History
            </Link>
          </div>

          {recentOrders.map((order) => (
            <article key={order.id} className="panel p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                    Order #{order.id}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {order?.laundryShop?.name || "Laundry shop unavailable"}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {order?.pickupAddress || "Pickup address unavailable"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      statusStyles[order?.status] ||
                      "border-white/15 bg-white/5 text-white"
                    }`}
                  >
                    {order?.status || "UNKNOWN"}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      paymentStyles[order?.paymentStatus] ||
                      "border-white/15 bg-white/5 text-white"
                    }`}
                  >
                    Payment: {order?.paymentStatus || "UNKNOWN"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Pickup Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(order?.pickupDate)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Created
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(order?.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Total Amount
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatCurrency(order?.totalAmount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Payment Method
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.payment?.method || "Not recorded"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Payment Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(order?.payment?.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Items
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.items?.length || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <Link to={`/orders/${order.id}`} className="btn-secondary w-full sm:w-auto">
                  View Full Order Details
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default CustomerDashboard;
