import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const getMinutesFromTime = (value) => {
  if (!value || !value.includes(":")) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const isShopOpenNow = (shop) => {
  const openMinutes = getMinutesFromTime(shop?.openTime);
  const closeMinutes = getMinutesFromTime(shop?.closeTime);

  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

function LaundryDetailsPage() {
  const { id } = useParams();
  const [laundry, setLaundry] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedUnitType, setSelectedUnitType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredServices = useMemo(() => {
    const normalizedSearch = serviceSearch.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        [service?.name, service?.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      if (!matchesSearch) {
        return false;
      }

      if (selectedUnitType === "All") {
        return true;
      }

      return service?.unitType === selectedUnitType;
    });
  }, [selectedUnitType, serviceSearch, services]);

  const grandTotal = selectedItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const addToOrder = (service) => {
    setSuccessMessage("");
    setSubmitError("");
    setSelectedItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.serviceId === service.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentItems,
        {
          serviceId: service.id,
          name: service.name,
          unitType: service.unitType,
          price: Number(service.price),
          quantity: 1,
        },
      ];
    });
  };

  const incrementQuantity = (serviceId) => {
    setSelectedItems((currentItems) =>
      currentItems.map((item) =>
        item.serviceId === serviceId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (serviceId) => {
    setSelectedItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.serviceId !== serviceId) {
          return [item];
        }

        if (item.quantity <= 1) {
          return [];
        }

        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
  };

  const removeItem = (serviceId) => {
    setSelectedItems((currentItems) =>
      currentItems.filter((item) => item.serviceId !== serviceId)
    );
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!selectedItems.length || !pickupAddress || !pickupDate) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSuccessMessage("");

      await apiClient.post("/orders", {
        laundryShopId: Number(id),
        pickupAddress,
        pickupDate: new Date(pickupDate).toISOString(),
        items: selectedItems.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
        })),
      });

      setSelectedItems([]);
      setPickupAddress("");
      setPickupDate("");
      setSuccessMessage("Order placed successfully.");
    } catch (submitOrderError) {
      setSubmitError(getApiErrorMessage(submitOrderError, "Unable to place the order right now."));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchLaundryData = async () => {
      try {
        setLoading(true);
        setError("");

        const [laundryResponse, servicesResponse] = await Promise.all([
          apiClient.get(`/laundries/${id}`),
          apiClient.get(`/services/shop/${id}`),
        ]);

        if (isMounted) {
          setLaundry(laundryResponse.data?.shop || null);
          setServices(servicesResponse.data?.services || []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError(getApiErrorMessage(fetchError, "Unable to load laundry details right now."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLaundryData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="space-y-6" aria-label="Loading laundry details">
        <div className="panel p-6 sm:p-8">
          <div className="skeleton h-6 w-32" />
          <div className="mt-4 skeleton h-10 w-2/3" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {[1, 2].map((card) => (
              <div key={card} className="panel p-6">
                <div className="skeleton h-8 w-1/2" />
                <div className="mt-4 space-y-2">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="panel p-6">
            <div className="skeleton h-8 w-1/2" />
            <div className="mt-6 space-y-4">
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel border border-red-400/30 bg-red-500/10 p-8 text-sm text-red-200">
        {error}
      </section>
    );
  }

  if (!laundry) {
    return (
      <section className="empty-state">
        <div className="text-3xl">🧺</div>
        <p className="mt-3 font-medium text-white">Laundry shop not found</p>
        <p className="mt-2">Try returning to the discovery page and choosing another active partner.</p>
        <Link to="/" className="btn-secondary mt-5 w-full sm:w-auto">
          Back to Laundries
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden bg-mesh p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Laundry Partner
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {laundry?.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {laundry?.address}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex w-fit items-center rounded-full border border-lime/30 bg-lime/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              {laundry?.status || "ACTIVE"}
            </span>
            <span
              className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                isShopOpenNow(laundry)
                  ? "border-lime-400/30 bg-lime-500/10 text-lime-200"
                  : "border-slate-400/30 bg-slate-500/10 text-slate-200"
              }`}
            >
              {isShopOpenNow(laundry) ? "Open now" : "Closed now"}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Phone
            </p>
            <p className="mt-2 text-base text-white">{laundry?.phone || "N/A"}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Opening Hours
            </p>
            <p className="mt-2 text-base text-white">
              {laundry?.openTime || "N/A"} - {laundry?.closeTime || "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Service Count
            </p>
            <p className="mt-2 text-base text-white">{services.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <Link to="/" className="btn-secondary w-full justify-center">
              Back to Laundries
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div className="space-y-8">
          <section className="panel p-6">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
                  Services
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Explore Available Services
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                  Search and filter the current service catalog before building
                  your laundry order.
                </p>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <label className="block xl:w-[28rem]">
                  <span className="sr-only">Search services</span>
                  <input
                    type="search"
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Search by service name or description"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
                  />
                </label>

                <label className="block xl:w-48">
                  <span className="sr-only">Filter unit type</span>
                  <select
                    value={selectedUnitType}
                    onChange={(event) => setSelectedUnitType(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-aqua/40"
                  >
                    <option value="All">All</option>
                    <option value="KG">KG</option>
                    <option value="ITEM">ITEM</option>
                  </select>
                </label>
              </div>

              <p className="text-sm text-slate-400">
                Showing {filteredServices.length} services
              </p>
            </div>
          </section>

          <section className="space-y-6">
            {filteredServices.length === 0 ? (
              <div className="panel p-6 text-sm text-slate-300">
                No services matched the current search or filter.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredServices.map((service) => (
                  <article key={service.id} className="panel p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">
                          {service?.name}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {service?.description || "No description available."}
                        </p>
                      </div>

                      <span className="inline-flex w-fit items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                        {service?.unitType}
                      </span>
                    </div>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Price
                        </dt>
                        <dd className="mt-2 text-base text-white">
                          Rs. {service?.price}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Estimated Time
                        </dt>
                        <dd className="mt-2 text-base text-white">
                          {service?.estimatedTime || "N/A"}
                        </dd>
                      </div>
                    </dl>

            <div className="mt-6">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => addToOrder(service)}
                aria-label={`Add ${service?.name || "service"} to order`}
              >
                Add to Order
              </button>
            </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="xl:sticky xl:top-24">
          <form className="panel p-6" onSubmit={handlePlaceOrder}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Order Builder
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Sticky Order Summary
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Add services, adjust quantities, and confirm pickup details
              before placing your next order.
            </p>

            <div className="mt-6">
              {selectedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-6 text-sm text-slate-300">
                  No services selected yet. Add services from the catalog to
                  start building your order.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map((item) => {
                    const itemSubtotal = Number(item.price) * item.quantity;

                    return (
                      <article
                        key={item.serviceId}
                        className="rounded-3xl border border-white/10 bg-slate-950/30 p-5"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {item.name}
                            </h3>
                            <span className="inline-flex items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                              {item.unitType}
                            </span>
                          </div>

                          <p className="text-sm text-slate-400">
                            Rs. {item.price} per {item.unitType.toLowerCase()}
                          </p>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                              <button
                                type="button"
                              className="h-11 w-11 rounded-full text-lg text-white transition hover:bg-white/10"
                              onClick={() => decrementQuantity(item.serviceId)}
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              -
                            </button>
                              <span className="min-w-10 text-center text-sm font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                              className="h-11 w-11 rounded-full text-lg text-white transition hover:bg-white/10"
                              onClick={() => incrementQuantity(item.serviceId)}
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              +
                            </button>
                            </div>

                            <button
                              type="button"
                              className="w-full rounded-full border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 sm:w-auto"
                              onClick={() => removeItem(item.serviceId)}
                              aria-label={`Remove ${item.name} from order`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                          <span className="text-slate-400">Subtotal</span>
                          <span className="text-lg font-semibold text-white">
                            Rs. {itemSubtotal}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Pickup Address
                </label>
                <textarea
                  className="field min-h-28 resize-none"
                  placeholder="Enter your full pickup address"
                  value={pickupAddress}
                  onChange={(event) => setPickupAddress(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Pickup Date
                </label>
                <input
                  type="datetime-local"
                  className="field"
                  value={pickupDate}
                  onChange={(event) => setPickupDate(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Selected Services</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-base text-slate-300">
                <span>Total Quantity</span>
                <span>
                  {selectedItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-slate-400">Grand Total</span>
                <span className="text-2xl font-semibold text-white">
                  Rs. {grandTotal}
                </span>
              </div>
            </div>

            {submitError ? (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {submitError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 rounded-2xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                submitting ||
                !selectedItems.length ||
                !pickupAddress.trim() ||
                !pickupDate
              }
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LaundryDetailsPage;
