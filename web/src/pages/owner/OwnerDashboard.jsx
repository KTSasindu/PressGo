import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";

const activeStatuses = [
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

const statusActionMap = {
  PENDING: [
    { label: "Accept Order", status: "ACCEPTED_BY_LAUNDRY" },
    { label: "Reject Order", status: "REJECTED" },
  ],
  ACCEPTED_BY_LAUNDRY: [
    { label: "Mark Picked Up", status: "PICKED_UP" },
  ],
  PICKED_UP: [
    { label: "Start Washing", status: "WASHING" },
  ],
  WASHING: [
    { label: "Ready For Delivery", status: "READY_FOR_DELIVERY" },
  ],
  READY_FOR_DELIVERY: [
    { label: "Mark Delivered", status: "DELIVERED" },
  ],
  DELIVERED: [
    { label: "Complete Order", status: "COMPLETED" },
  ],
};

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

const getAvailableActions = (status) => statusActionMap[status] || [];

function OwnerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/orders/owner/orders");
      setOrders(response.data?.orders || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load laundry owner orders right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to update order status right now."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order?.status === "PENDING").length;
  const activeProcessingOrders = orders.filter((order) =>
    activeStatuses.includes(order?.status)
  ).length;
  const completedOrders = orders.filter(
    (order) => order?.status === "COMPLETED"
  ).length;

  const summaryCards = [
    { label: "Total Orders", value: totalOrders, tone: "text-aqua" },
    { label: "Pending Orders", value: pendingOrders, tone: "text-amber-200" },
    {
      label: "Active Processing",
      value: activeProcessingOrders,
      tone: "text-cyan-200",
    },
    { label: "Completed Orders", value: completedOrders, tone: "text-lime" },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Laundry Owner"
        title="Run shop operations from one focused workspace."
        description="Review incoming customer orders, move them through the laundry workflow, and keep operations flowing smoothly."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Live operations summary based on your current shop orders.
            </p>
          </div>
        ))}
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading incoming orders...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No customer orders are assigned to your laundry shop yet.
        </section>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <section className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="panel p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                    Order #{order.id}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {order?.customer?.name || "Customer unavailable"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {order?.customer?.phone || "Phone unavailable"}
                  </p>
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
                    Items
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.items?.length || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white">
                  Ordered Services
                </h3>

                {order?.items?.length ? (
                  <div className="mt-4 grid gap-4">
                    {order.items.map((item) => {
                      const quantity = Number(item?.quantity || 0);
                      const price = Number(item?.price || 0);
                      const subtotal = quantity * price;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h4 className="text-base font-semibold text-white">
                                {item?.service?.name || "Service unavailable"}
                              </h4>
                              <p className="mt-1 text-sm text-slate-400">
                                {item?.service?.description ||
                                  "No service description available."}
                              </p>
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                              {item?.service?.unitType || "UNIT"}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-slate-400">Quantity</p>
                              <p className="mt-1 text-white">{quantity}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Price</p>
                              <p className="mt-1 text-white">
                                {formatCurrency(price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Subtotal</p>
                              <p className="mt-1 text-white">
                                {formatCurrency(subtotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-4 text-sm text-slate-300">
                    No order items available for this order.
                  </div>
                )}
              </div>

              {getAvailableActions(order?.status).length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                  {getAvailableActions(order.status).map((action) => (
                    <button
                      key={`${order.id}-${action.status}`}
                      type="button"
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusUpdate(order.id, action.status)}
                    >
                      {updatingOrderId === order.id
                        ? "Updating..."
                        : action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default OwnerDashboard;
