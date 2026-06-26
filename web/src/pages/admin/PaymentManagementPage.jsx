import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const paymentStyles = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PAID: "border-lime-400/30 bg-lime-500/10 text-lime-200",
  FAILED: "border-red-400/30 bg-red-500/10 text-red-200",
  REFUNDED: "border-slate-400/30 bg-slate-500/10 text-slate-200",
};

const filterOptions = ["All", "Paid", "Pending", "Failed", "Refunded"];

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/payments/admin/all");

        if (isMounted) {
          setPayments(response.data?.payments || []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError(getApiErrorMessage(fetchError, "Unable to load payment records right now."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedFilter = activeFilter.toUpperCase();
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesFilter =
        activeFilter === "All" || payment?.status === normalizedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const orderId = String(payment?.orderId || "");
      const customerName = payment?.order?.customer?.name?.toLowerCase() || "";

      return (
        orderId.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch)
      );
    });
  }, [activeFilter, payments, searchTerm]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin Payments"
        title="Track payment records across the platform."
        description="Review customer payments, filter by status, and search order-linked records from one clean admin workspace."
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
            <span className="sr-only">Search payments</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order ID or customer name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
            />
          </label>
        </div>
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading payment records...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && filteredPayments.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No payments matched the current filter or search.
        </section>
      ) : null}

      {!loading && !error && filteredPayments.length > 0 ? (
        <section className="grid gap-6">
          {filteredPayments.map((payment) => (
            <article key={payment.id} className="panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                    Payment #{payment.id}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Order #{payment?.orderId ?? "N/A"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {payment?.order?.customer?.name || "Customer unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {payment?.order?.laundryShop?.name ||
                      "Laundry shop unavailable"}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    paymentStyles[payment?.status] ||
                    "border-white/15 bg-white/5 text-white"
                  }`}
                >
                  {payment?.status || "UNKNOWN"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Customer
                  </p>
                  <p className="mt-2 text-base text-white">
                    {payment?.order?.customer?.name || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Laundry Shop
                  </p>
                  <p className="mt-2 text-base text-white">
                    {payment?.order?.laundryShop?.name || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Amount
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatCurrency(payment?.amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Method
                  </p>
                  <p className="mt-2 text-base text-white">
                    {payment?.method || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Created
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(payment?.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default PaymentManagementPage;
