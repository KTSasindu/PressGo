import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";

const deliveryFilters = ["All", "Pending Pickup", "In Transit", "Delivered"];

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

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not yet";

const getDeliveryState = (delivery) => {
  if (delivery?.deliveredAt) {
    return "Delivered";
  }

  if (delivery?.pickedUpAt) {
    return "In Transit";
  }

  return "Pending Pickup";
};

function DeliveryManagementPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    orderId: "",
    driverId: "",
    pickupNote: "",
    deliveryNote: "",
  });

  const fetchDispatchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [deliveriesResponse, usersResponse, ordersResponse] =
        await Promise.all([
          apiClient.get("/deliveries/admin/all"),
          apiClient.get("/admin/users"),
          apiClient.get("/orders/admin/all"),
        ]);

      const nextDeliveries = deliveriesResponse.data?.deliveries || [];
      const nextUsers = usersResponse.data?.users || [];
      const nextOrders = ordersResponse.data?.orders || [];

      setDeliveries(nextDeliveries);
      setDrivers(nextUsers.filter((user) => user?.role === "DRIVER"));
      setOrders(nextOrders);
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        fetchError.response?.data?.message ||
          "Unable to load delivery dispatch records right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchData();
  }, []);

  const assignedOrderIds = useMemo(
    () =>
      new Set(
        deliveries
          .map((delivery) => delivery?.order?.id)
          .filter((orderId) => Number.isFinite(orderId))
      ),
    [deliveries]
  );

  const availableOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          !assignedOrderIds.has(order?.id) &&
          !["COMPLETED", "CANCELLED", "REJECTED"].includes(order?.status)
      ),
    [assignedOrderIds, orders]
  );

  const filteredDeliveries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const deliveryState = getDeliveryState(delivery);
      const matchesFilter =
        activeFilter === "All" || deliveryState === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const orderId = String(delivery?.order?.id || "");
      const customerName =
        delivery?.order?.customer?.name?.toLowerCase() || "";
      const driverName = delivery?.driver?.name?.toLowerCase() || "";

      return (
        orderId.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        driverName.includes(normalizedSearch)
      );
    });
  }, [activeFilter, deliveries, searchTerm]);

  const totalDeliveries = deliveries.length;
  const pendingPickup = deliveries.filter(
    (delivery) => getDeliveryState(delivery) === "Pending Pickup"
  ).length;
  const inTransit = deliveries.filter(
    (delivery) => getDeliveryState(delivery) === "In Transit"
  ).length;
  const delivered = deliveries.filter(
    (delivery) => getDeliveryState(delivery) === "Delivered"
  ).length;

  const summaryCards = [
    { label: "Total Deliveries", value: totalDeliveries, tone: "text-aqua" },
    { label: "Pending Pickup", value: pendingPickup, tone: "text-amber-200" },
    { label: "In Transit", value: inTransit, tone: "text-cyan-200" },
    { label: "Delivered", value: delivered, tone: "text-lime" },
  ];

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignmentForm((current) => ({ ...current, [name]: value }));
  };

  const handleAssignDriver = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await apiClient.post("/deliveries/assign", {
        orderId: Number(assignmentForm.orderId),
        driverId: Number(assignmentForm.driverId),
        pickupNote: assignmentForm.pickupNote || undefined,
        deliveryNote: assignmentForm.deliveryNote || undefined,
      });

      setAssignmentForm({
        orderId: "",
        driverId: "",
        pickupNote: "",
        deliveryNote: "",
      });
      setSuccessMessage("Driver assigned successfully.");
      await fetchDispatchData();
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError.response?.data?.message ||
          "Unable to assign a driver right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin Deliveries"
        title="Dispatch drivers and monitor delivery assignments."
        description="Review delivery workload, assign drivers to active orders, and track pickup and delivery completion across the platform."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Live dispatch visibility across driver assignments and customer
              delivery progress.
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <div className="panel p-6 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Assign Delivery
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Dispatch a driver to an order
            </h2>
          </div>

          {successMessage ? (
            <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-500/10 p-4 text-sm text-lime-100">
              {successMessage}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleAssignDriver}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Order
              </label>
              <select
                name="orderId"
                className="field"
                value={assignmentForm.orderId}
                onChange={handleAssignmentChange}
                disabled={submitting || loading}
                required
              >
                <option value="">Select an order</option>
                {availableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id} - {order?.customer?.name || "Customer"} -{" "}
                    {order?.laundryShop?.name || "Laundry Shop"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Driver
              </label>
              <select
                name="driverId"
                className="field"
                value={assignmentForm.driverId}
                onChange={handleAssignmentChange}
                disabled={submitting || loading}
                required
              >
                <option value="">Select a driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver?.name || "Driver"} - {driver?.phone || "No phone"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Pickup Note
              </label>
              <textarea
                name="pickupNote"
                rows="3"
                className="field resize-none"
                value={assignmentForm.pickupNote}
                onChange={handleAssignmentChange}
                disabled={submitting}
                placeholder="Call the customer before pickup"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Delivery Note
              </label>
              <textarea
                name="deliveryNote"
                rows="3"
                className="field resize-none"
                value={assignmentForm.deliveryNote}
                onChange={handleAssignmentChange}
                disabled={submitting}
                placeholder="Optional note for final delivery handoff"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
              Available orders exclude assignments that already have a driver
              and orders that are already completed or closed.
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                submitting ||
                !assignmentForm.orderId ||
                !assignmentForm.driverId
              }
            >
              {submitting ? "Assigning..." : "Assign Driver"}
            </button>
          </form>
        </div>

        <div className="panel p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {deliveryFilters.map((filterOption) => (
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
              <span className="sr-only">Search deliveries</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by order ID, customer, or driver"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
              />
            </label>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading delivery assignments...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && filteredDeliveries.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No delivery assignments matched the current filter or search.
        </section>
      ) : null}

      {!loading && !error && filteredDeliveries.length > 0 ? (
        <section className="grid gap-6">
          {filteredDeliveries.map((delivery) => {
            const order = delivery?.order;
            const deliveryState = getDeliveryState(delivery);

            return (
              <article key={delivery.id} className="panel p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                      Delivery #{delivery.id}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Order #{order?.id ?? "N/A"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {order?.customer?.name || "Customer unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {order?.customer?.phone || "Phone unavailable"}
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

                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                      {deliveryState}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Pickup Address
                    </p>
                    <p className="mt-2 text-base text-white">
                      {order?.pickupAddress || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Laundry Shop
                    </p>
                    <p className="mt-2 text-base text-white">
                      {order?.laundryShop?.name || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Assigned Driver
                    </p>
                    <p className="mt-2 text-base text-white">
                      {delivery?.driver?.name || "Unassigned"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Current State
                    </p>
                    <p className="mt-2 text-base text-white">{deliveryState}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Picked Up At
                    </p>
                    <p className="mt-2 text-base text-white">
                      {formatDate(delivery?.pickedUpAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Delivered At
                    </p>
                    <p className="mt-2 text-base text-white">
                      {formatDate(delivery?.deliveredAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Pickup Note
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {delivery?.pickupNote || "No pickup note provided."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Delivery Note
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {delivery?.deliveryNote || "No delivery note recorded yet."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

export default DeliveryManagementPage;
