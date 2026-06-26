import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";
import { getApiErrorMessage } from "../../utils/apiError.js";
import {
  formatRelativeTime,
  formatTimestamp,
} from "../../utils/dateHelpers.js";

const filterOptions = [
  "All",
  "PENDING",
  "ACCEPTED_BY_LAUNDRY",
  "PICKED_UP",
  "WASHING",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
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

const getUpdatedIds = (currentOrders, nextOrders) => {
  const now = Date.now();
  const currentOrderMap = new Map(
    currentOrders.map((order) => [order?.id, order?.status])
  );

  return nextOrders.reduce((updates, order) => {
    const previousStatus = currentOrderMap.get(order?.id);

    if (previousStatus && previousStatus !== order?.status) {
      updates[order.id] = now;
    }

    return updates;
  }, {});
};

function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [recentlyUpdatedMap, setRecentlyUpdatedMap] = useState({});

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
      setRecentlyUpdatedMap((currentMap) =>
        Object.fromEntries(
          Object.entries(currentMap).filter(
            ([, timestamp]) => Date.now() - timestamp < 30000
          )
        )
      );
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async (showLoader = true) => {
      try {
        if (showLoader && isMounted) {
          setLoading(true);
        }

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
          setOrders((currentOrders) => {
            const updates = getUpdatedIds(currentOrders, ordersWithPayments);

            if (Object.keys(updates).length > 0) {
              setRecentlyUpdatedMap((currentMap) => ({
                ...currentMap,
                ...updates,
              }));
            }

            return ordersWithPayments;
          });
          setLastUpdatedAt(new Date().toISOString());
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError(getApiErrorMessage(fetchError, "Unable to load your orders right now."));
        }
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" || order?.status === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const orderId = String(order?.id || "");
      const shopName = order?.laundryShop?.name?.toLowerCase() || "";

      return (
        orderId.includes(normalizedSearch) ||
        shopName.includes(normalizedSearch)
      );
    });
  }, [activeFilter, orders, searchTerm]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Customer Orders"
        title="Track every laundry order in one dedicated workspace."
        description="Search your order history, filter by progress stage, review payments, and jump into the full order timeline whenever you need more detail."
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((filterOption) => (
              <button
                key={filterOption}
                type="button"
                onClick={() => setActiveFilter(filterOption)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition",
                  activeFilter === filterOption
                    ? "border-aqua/40 bg-aqua/10 text-aqua"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white",
                ].join(" ")}
              >
                {filterOption}
              </button>
            ))}
          </div>

          <label className="block lg:w-80">
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order ID or laundry shop"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>{filteredOrders.length} matching orders</span>
          <span>
            Last updated{" "}
            {lastUpdatedAt ? formatRelativeTime(lastUpdatedAt, now) : "N/A"}
          </span>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-6" aria-label="Loading customer orders">
          {[1, 2].map((card) => (
            <div key={card} className="panel p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-8 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="skeleton h-24 w-full" />
                ))}
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

      {!loading && !error && filteredOrders.length === 0 ? (
        <section className="empty-state">
          <div className="text-3xl">🧾</div>
          <p className="mt-3 font-medium text-white">No orders yet</p>
          <p className="mt-2">
            Try a different filter or start a new order from the laundry
            discovery page.
          </p>
          <Link to="/" className="btn-primary mt-5 w-full sm:w-auto">
            Find Laundry
          </Link>
        </section>
      ) : null}

      {!loading && !error && filteredOrders.length > 0 ? (
        <section className="space-y-6">
          {filteredOrders.map((order) => (
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

                  {recentlyUpdatedMap[order.id] ? (
                    <span className="inline-flex items-center rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                      Recently Updated
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Pickup Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(order?.pickupDate)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Created
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(order?.createdAt)}
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

export default CustomerOrdersPage;
