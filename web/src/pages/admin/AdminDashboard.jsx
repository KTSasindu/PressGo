import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";

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

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, recentOrdersResponse] = await Promise.all([
          apiClient.get("/admin/dashboard-stats"),
          apiClient.get("/admin/recent-orders"),
        ]);

        if (isMounted) {
          setStats(statsResponse.data?.stats || null);
          setRecentOrders(recentOrdersResponse.data?.orders || []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("Unable to load admin dashboard data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const overviewCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, tone: "text-aqua" },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      tone: "text-cyan-200",
    },
    {
      label: "Laundry Owners",
      value: stats?.totalLaundryOwners ?? 0,
      tone: "text-coral",
    },
    { label: "Total Shops", value: stats?.totalShops ?? 0, tone: "text-white" },
    {
      label: "Active Shops",
      value: stats?.activeShops ?? 0,
      tone: "text-lime",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      tone: "text-aqua",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      tone: "text-amber-200",
    },
    {
      label: "Completed Orders",
      value: stats?.completedOrders ?? 0,
      tone: "text-lime",
    },
    {
      label: "Total Payments",
      value: stats?.totalPayments ?? 0,
      tone: "text-cyan-200",
    },
    {
      label: "Paid Payments",
      value: stats?.paidPayments ?? 0,
      tone: "text-lime",
    },
    {
      label: "Average Rating",
      value: stats?.averageRating ?? 0,
      tone: "text-coral",
    },
  ];

  const revenueCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue),
      tone: "text-aqua",
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(stats?.platformRevenue),
      tone: "text-coral",
    },
    {
      label: "Laundry Revenue",
      value: formatCurrency(stats?.laundryRevenue),
      tone: "text-lime",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin"
        title="Monitor the full PressGo platform."
        description="Get a live view of users, laundries, orders, payments, and revenue from one platform command center."
      />

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading platform analytics...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => (
              <div key={card.label} className="panel p-6">
                <p className="text-sm text-slate-400">{card.label}</p>
                <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
                  {card.value}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Live platform summary metric from the PressGo backend.
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {revenueCards.map((card) => (
              <div key={card.label} className="panel p-6">
                <p className="text-sm text-slate-400">{card.label}</p>
                <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
                  {card.value}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Revenue breakdown derived from paid platform activity.
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="panel p-6">
              <p className="text-sm text-slate-400">Operational Health</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Pending vs Completed
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Pending orders: {stats?.pendingOrders ?? 0}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Completed orders: {stats?.completedOrders ?? 0}
              </p>
            </div>

            <div className="panel p-6">
              <p className="text-sm text-slate-400">Network Health</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Laundry Coverage
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Active shops: {stats?.activeShops ?? 0}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Total shops: {stats?.totalShops ?? 0}
              </p>
            </div>

            <div className="panel p-6">
              <p className="text-sm text-slate-400">Payment Health</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Payment Completion
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Paid payments: {stats?.paidPayments ?? 0}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Total payments: {stats?.totalPayments ?? 0}
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Recent Orders
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Latest Platform Activity
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Review the most recent orders moving across the PressGo
                platform.
              </p>
            </div>

            {recentOrders.length === 0 ? (
              <div className="panel p-6 text-sm text-slate-300">
                No recent orders are available yet.
              </div>
            ) : (
              <div className="grid gap-6">
                {recentOrders.map((order) => (
                  <article key={order.id} className="panel p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                          Order #{order.id}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                          {order?.customer?.name || "Customer unavailable"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">
                          {order?.laundryShop?.name ||
                            "Laundry shop unavailable"}
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

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
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
                          Created
                        </p>
                        <p className="mt-2 text-base text-white">
                          {formatDate(order?.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Pickup Address
                        </p>
                        <p className="mt-2 text-base text-white">
                          {order?.pickupAddress || "Unavailable"}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
