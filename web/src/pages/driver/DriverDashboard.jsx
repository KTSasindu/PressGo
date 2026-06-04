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

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not yet";

function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/deliveries/my-deliveries");
      setDeliveries(response.data?.deliveries || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load your assigned deliveries right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleMarkPickedUp = async (deliveryId) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      setError("");
      await apiClient.patch(`/deliveries/${deliveryId}/picked-up`);
      await fetchDeliveries();
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to mark this delivery as picked up."
      );
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  const handleMarkDelivered = async (deliveryId) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      setError("");
      await apiClient.patch(`/deliveries/${deliveryId}/delivered`, {});
      await fetchDeliveries();
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to mark this delivery as delivered."
      );
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  const totalDeliveries = deliveries.length;
  const pendingPickup = deliveries.filter(
    (delivery) => !delivery?.pickedUpAt
  ).length;
  const inDelivery = deliveries.filter(
    (delivery) => delivery?.pickedUpAt && !delivery?.deliveredAt
  ).length;
  const delivered = deliveries.filter(
    (delivery) => Boolean(delivery?.deliveredAt)
  ).length;

  const summaryCards = [
    { label: "Total Deliveries", value: totalDeliveries, tone: "text-aqua" },
    { label: "Pending Pickup", value: pendingPickup, tone: "text-amber-200" },
    { label: "In Delivery", value: inDelivery, tone: "text-cyan-200" },
    { label: "Delivered", value: delivered, tone: "text-lime" },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Driver"
        title="Handle assigned pickups and deliveries with confidence."
        description="Review each delivery assignment, keep customers moving, and update pickup and delivery progress from one focused driver dashboard."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Live delivery workload summary for your assigned route list.
            </p>
          </div>
        ))}
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading assigned deliveries...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && deliveries.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No deliveries are assigned to you yet. New pickup requests will show
          up here as soon as they are dispatched.
        </section>
      ) : null}

      {!loading && !error && deliveries.length > 0 ? (
        <section className="space-y-6">
          {deliveries.map((delivery) => {
            const order = delivery?.order;
            const isPickedUp = Boolean(delivery?.pickedUpAt);
            const isDelivered = Boolean(delivery?.deliveredAt);

            return (
              <article key={delivery.id} className="panel p-6 md:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                      Delivery #{delivery.id}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Order #{order?.id ?? "N/A"}
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

                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                      {isDelivered
                        ? "Delivered"
                        : isPickedUp
                          ? "In Delivery"
                          : "Pending Pickup"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Customer
                    </p>
                    <p className="mt-2 text-base text-white">
                      {order?.customer?.name || "Unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {order?.customer?.phone || "Phone unavailable"}
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
                      Picked Up At
                    </p>
                    <p className="mt-2 text-base text-white">
                      {formatDate(delivery?.pickedUpAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Delivered At
                    </p>
                    <p className="mt-2 text-base text-white">
                      {formatDate(delivery?.deliveredAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

                {Array.isArray(order?.items) && order.items.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white">
                      Assigned Services
                    </h3>
                    <div className="mt-4 grid gap-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="text-base font-semibold text-white">
                                {item?.service?.name || "Service unavailable"}
                              </h4>
                              <p className="mt-1 text-sm text-slate-400">
                                Qty: {item?.quantity ?? 0}
                              </p>
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                              {item?.service?.unitType || "UNIT"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 border-t border-white/10 pt-6">
                  {!isPickedUp ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={updatingDeliveryId === delivery.id}
                      onClick={() => handleMarkPickedUp(delivery.id)}
                    >
                      {updatingDeliveryId === delivery.id
                        ? "Updating..."
                        : "Mark Picked Up"}
                    </button>
                  ) : null}

                  {isPickedUp && !isDelivered ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={updatingDeliveryId === delivery.id}
                      onClick={() => handleMarkDelivered(delivery.id)}
                    >
                      {updatingDeliveryId === delivery.id
                        ? "Updating..."
                        : "Mark Delivered"}
                    </button>
                  ) : null}

                  {isDelivered ? (
                    <span className="inline-flex items-center rounded-full border border-lime-400/30 bg-lime-500/10 px-4 py-2 text-sm font-semibold text-lime">
                      Delivered
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

export default DriverDashboard;
