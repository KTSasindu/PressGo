import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";
import { getUser } from "../../utils/authStorage.js";
import {
  formatRelativeTime,
  formatTimestamp,
} from "../../utils/dateHelpers.js";

const timelineSteps = [
  "PENDING",
  "ACCEPTED_BY_LAUNDRY",
  "PICKED_UP",
  "WASHING",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

const statusSequence = [...timelineSteps];

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
const formatStatusLabel = (value) =>
  value ? value.replaceAll("_", " ") : "UNKNOWN";

const getTimelineIndex = (status) => {
  if (status === "CANCELLED" || status === "REJECTED") {
    return 0;
  }

  const sequenceIndex = statusSequence.indexOf(status);
  return sequenceIndex === -1 ? 0 : sequenceIndex;
};

const getStageState = (index, currentIndex, status) => {
  if (status === "CANCELLED" || status === "REJECTED") {
    return index === 0 ? "current" : "future";
  }

  if (index < currentIndex) {
    return "completed";
  }

  if (index === currentIndex) {
    return "current";
  }

  return "future";
};

const getStagePresentation = (state) => {
  if (state === "completed") {
    return {
      card: "border-lime-400/30 bg-lime-500/10 text-lime-50",
      marker: "border-lime-400/40 bg-lime-500 text-slate-950",
      connector: "bg-lime-400/60",
      icon: "✓",
    };
  }

  if (state === "current") {
    return {
      card: "border-aqua/40 bg-aqua/10 text-white shadow-lg shadow-aqua/10",
      marker: "border-aqua/50 bg-aqua/20 text-aqua",
      connector: "bg-white/10",
      icon: "●",
    };
  }

  return {
    card: "border-white/10 bg-white/5 text-slate-400",
    marker: "border-white/10 bg-slate-950/50 text-slate-500",
    connector: "bg-white/10",
    icon: "○",
  };
};

function OrderDetailsPage() {
  const { id } = useParams();
  const user = getUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [statusUpdatedAt, setStatusUpdatedAt] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async (showLoader = true) => {
      try {
        if (showLoader && isMounted) {
          setLoading(true);
        }

        setError("");
        setNotFound(false);
        const response = await apiClient.get(`/orders/${id}`);
        const nextOrder = response.data?.order || null;

        if (isMounted) {
          setOrder((currentOrder) => {
            if (
              currentOrder?.status &&
              nextOrder?.status &&
              currentOrder.status !== nextOrder.status
            ) {
              setStatusUpdatedAt(Date.now());
            }

            return nextOrder;
          });
          setLastUpdatedAt(new Date().toISOString());
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (!isMounted) {
          return;
        }

        if (fetchError.response?.status === 404) {
          setNotFound(true);
          setOrder(null);
          return;
        }

        setError(
          fetchError.response?.data?.message ||
            "Unable to load this order right now."
        );
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();
    const intervalId = setInterval(() => {
      fetchOrder(false);
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id]);

  const currentTimelineIndex = getTimelineIndex(order?.status);
  const dashboardPath =
    {
      ADMIN: "/admin/dashboard",
      LAUNDRY_OWNER: "/owner/dashboard",
      CUSTOMER: "/customer/dashboard",
    }[user?.role] || "/";
  const canReview =
    user?.role === "CUSTOMER" &&
    order?.status === "COMPLETED" &&
    !order?.review;
  const sortedStatusHistory = Array.isArray(order?.statusHistory)
    ? [...order.statusHistory].sort(
        (firstEntry, secondEntry) =>
          new Date(firstEntry?.createdAt || 0).getTime() -
          new Date(secondEntry?.createdAt || 0).getTime()
      )
    : [];
  const showRecentlyUpdated =
    statusUpdatedAt && Date.now() - statusUpdatedAt < 30000;

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewSuccess("");

      const response = await apiClient.post("/reviews", {
        orderId: Number(id),
        rating: Number(rating),
        comment,
      });

      setOrder((currentOrder) => ({
        ...currentOrder,
        review: response.data?.review || {
          rating: Number(rating),
          comment,
        },
      }));
      setReviewSuccess("Review submitted successfully.");
      setComment("");
    } catch (submitError) {
      console.error(submitError);
      setReviewError(
        submitError.response?.data?.message ||
          "Unable to submit your review right now."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Order Details"
        title={`Track order #${id} from pickup to completion.`}
        description="Review order progress, customer and laundry details, payment tracking, delivery progress, and item-level breakdowns from one dedicated screen."
        actions={
          <Link to={dashboardPath} className="btn-secondary">
            Back to Dashboard
          </Link>
        }
      />

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading order details...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && notFound ? (
        <section className="panel p-6 text-sm text-slate-300">
          This order could not be found or is no longer available.
        </section>
      ) : null}

      {!loading && !error && !notFound && !order ? (
        <section className="panel p-6 text-sm text-slate-300">
          No order details are available right now.
        </section>
      ) : null}

      {!loading && !error && !notFound && order ? (
        <>
          <section className="panel p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                  Order #{order.id}
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  {order?.laundryShop?.name || "Laundry shop unavailable"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
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
                    paymentStyles[order?.payment?.status || order?.paymentStatus] ||
                    "border-white/15 bg-white/5 text-white"
                  }`}
                >
                  Payment:{" "}
                  {order?.payment?.status || order?.paymentStatus || "UNKNOWN"}
                </span>

                {showRecentlyUpdated ? (
                  <span className="inline-flex items-center rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                    Recently Updated
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>Auto-refresh every 20 seconds</span>
              <span>
                Last updated{" "}
                {lastUpdatedAt ? formatRelativeTime(lastUpdatedAt, now) : "N/A"}
              </span>
            </div>

            {(order?.status === "CANCELLED" || order?.status === "REJECTED") ? (
              <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                {order.status === "CANCELLED"
                  ? "This order has been cancelled. Please contact support or the laundry partner if you need more context."
                  : "This order was rejected by the laundry partner. Review the order details or place a new request if needed."}
              </div>
            ) : null}
          </section>

          <section className="panel p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                  Timeline
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Order Progress
                </h2>
              </div>

              <span className="text-sm text-slate-400">
                Current step: {formatStatusLabel(order?.status || "PENDING")}
              </span>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
              <div className="space-y-0">
                {timelineSteps.map((step, index) => {
                  const stageState = getStageState(
                    index,
                    currentTimelineIndex,
                    order?.status
                  );
                  const stagePresentation = getStagePresentation(stageState);
                  const isCurrent = stageState === "current";
                  const isLast = index === timelineSteps.length - 1;

                  return (
                    <div
                      key={step}
                      className="grid grid-cols-[auto_1fr] gap-4 pb-5 last:pb-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            "relative flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                            stagePresentation.marker,
                          ].join(" ")}
                        >
                          {isCurrent ? (
                            <span className="absolute inset-0 rounded-full border border-aqua/40 animate-ping" />
                          ) : null}
                          <span className="relative z-10">
                            {stagePresentation.icon}
                          </span>
                        </div>

                        {!isLast ? (
                          <div
                            className={`mt-2 h-full min-h-10 w-px ${stagePresentation.connector}`}
                          />
                        ) : null}
                      </div>

                      <div
                        className={[
                          "rounded-3xl border px-5 py-4 transition",
                          stagePresentation.card,
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                              Stage {index + 1}
                            </p>
                            <h3 className="mt-2 text-base font-semibold">
                              {formatStatusLabel(step)}
                            </h3>
                          </div>

                          <span className="text-xs uppercase tracking-[0.2em] text-slate-300/90">
                            {stageState === "completed"
                              ? "Completed"
                              : isCurrent
                                ? "In progress"
                                : "Upcoming"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {step === "PENDING" &&
                            "Your order was created and is waiting for the laundry partner to review it."}
                          {step === "ACCEPTED_BY_LAUNDRY" &&
                            "The laundry owner has accepted your request and is preparing the next step."}
                          {step === "PICKED_UP" &&
                            "Your items have been picked up and are moving through the service workflow."}
                          {step === "WASHING" &&
                            "The laundry team is actively washing and processing your items."}
                          {step === "READY_FOR_DELIVERY" &&
                            "Your order is finished and queued for return delivery."}
                          {step === "DELIVERED" &&
                            "The delivery handoff is complete and the order is awaiting final closure."}
                          {step === "COMPLETED" &&
                            "The order lifecycle is complete and you can leave a review if you are the customer."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
                  Status History
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Event Log
                </h3>

                {sortedStatusHistory.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {sortedStatusHistory.map((entry, index) => (
                      <article
                        key={`${entry?.status || "status"}-${entry?.createdAt || index}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <span
                            className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                              statusStyles[entry?.status] ||
                              "border-white/15 bg-white/5 text-white"
                            }`}
                          >
                            {formatStatusLabel(entry?.status)}
                          </span>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {formatTimestamp(entry?.createdAt)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {entry?.note ||
                            "No additional note was provided for this update."}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-4 text-sm text-slate-300">
                    No status history entries are available for this order yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Order Information
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Order ID
                  </p>
                  <p className="mt-2 text-base text-white">#{order?.id ?? "N/A"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Created Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(order?.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Pickup Address
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.pickupAddress || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Pickup Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(order?.pickupDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Customer
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Name
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.customer?.name || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.customer?.email || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Phone
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.customer?.phone || "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Laundry
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Shop Name
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.laundryShop?.name || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.laundryShop?.address || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Phone
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.laundryShop?.phone || "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Payment
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Amount
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatCurrency(order?.payment?.amount || order?.totalAmount)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.payment?.status ||
                      order?.paymentStatus ||
                      "Unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Method
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.payment?.method || "Not recorded"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Paid Date
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.payment?.status === "PAID"
                      ? formatTimestamp(order?.payment?.createdAt)
                      : "Not paid yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6 xl:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Delivery
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Driver Name
                  </p>
                  <p className="mt-2 text-base text-white">
                    {order?.deliveryAssignment?.driver?.name ||
                      "Not available from current API"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Picked Up At
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(
                      order?.deliveryAssignment?.pickedUpAt,
                      "Not available from current API"
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Delivered At
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatTimestamp(
                      order?.deliveryAssignment?.deliveredAt,
                      "Not available from current API"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Order Items
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Service Breakdown
              </h2>
            </div>

            {Array.isArray(order?.items) && order.items.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {order.items.map((item) => {
                  const quantity = Number(item?.quantity || 0);
                  const unitPrice = Number(item?.price || 0);
                  const subtotal = quantity * unitPrice;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {item?.service?.name || "Service unavailable"}
                          </h3>
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
                          <p className="text-slate-400">Unit Price</p>
                          <p className="mt-1 text-white">
                            {formatCurrency(unitPrice)}
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
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-4 text-sm text-slate-300">
                No item details are available for this order.
              </div>
            )}
          </section>

          <section className="panel p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Review
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Share your experience
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Customers can rate completed orders once. Your feedback helps
                improve service quality across PressGo.
              </p>
            </div>

            {order?.review ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/20 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Your rating</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {"★".repeat(Number(order.review?.rating || 0))}
                      <span className="ml-2 text-base text-slate-300">
                        {order.review?.rating || 0}/5
                      </span>
                    </p>
                  </div>

                  <p className="text-sm text-slate-400">Submitted review</p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-7 text-slate-200">
                    {order.review?.comment || "No comment provided."}
                  </p>
                </div>
              </div>
            ) : null}

            {reviewSuccess ? (
              <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-500/10 px-4 py-3 text-sm text-lime-100">
                {reviewSuccess}
              </div>
            ) : null}

            {reviewError ? (
              <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {reviewError}
              </div>
            ) : null}

            {canReview ? (
              <form className="mt-6 space-y-5" onSubmit={handleReviewSubmit}>
                <div>
                  <label
                    htmlFor="rating"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Rating
                  </label>
                  <select
                    id="rating"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    className="field"
                    disabled={reviewSubmitting}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Star{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    rows="5"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="field resize-none"
                    placeholder="Tell us how the order went."
                    disabled={reviewSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : null}

            {!order?.review && !canReview ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-4 text-sm text-slate-300">
                Reviews become available for customers once an order reaches
                the completed stage.
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default OrderDetailsPage;
