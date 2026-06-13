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
  ACCEPTED_BY_LAUNDRY: [{ label: "Mark Picked Up", status: "PICKED_UP" }],
  PICKED_UP: [{ label: "Start Washing", status: "WASHING" }],
  WASHING: [{ label: "Ready For Delivery", status: "READY_FOR_DELIVERY" }],
  READY_FOR_DELIVERY: [{ label: "Mark Delivered", status: "DELIVERED" }],
  DELIVERED: [{ label: "Complete Order", status: "COMPLETED" }],
};

const emptyShopForm = {
  name: "",
  address: "",
  phone: "",
  openTime: "",
  closeTime: "",
};

const emptyServiceForm = {
  name: "",
  description: "",
  price: "",
  unitType: "KG",
  estimatedTime: "",
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

  const [shop, setShop] = useState(null);
  const [shopForm, setShopForm] = useState(emptyShopForm);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState("");
  const [shopSuccess, setShopSuccess] = useState("");
  const [savingShop, setSavingShop] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceForm, setEditingServiceForm] = useState(emptyServiceForm);
  const [updatingServiceId, setUpdatingServiceId] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

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

  const fetchShop = async () => {
    try {
      setShopLoading(true);
      setShopError("");
      const response = await apiClient.get("/laundries/owner/my-shop");
      const nextShop = response.data?.shop || null;
      setShop(nextShop);
      setShopForm({
        name: nextShop?.name || "",
        address: nextShop?.address || "",
        phone: nextShop?.phone || "",
        openTime: nextShop?.openTime || "",
        closeTime: nextShop?.closeTime || "",
      });
    } catch (fetchError) {
      console.error(fetchError);
      setShopError(
        fetchError.response?.data?.message ||
          "Unable to load your shop profile right now."
      );
    } finally {
      setShopLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError("");
      const response = await apiClient.get("/services/owner/my-services");
      setServices(response.data?.services || []);
    } catch (fetchError) {
      console.error(fetchError);
      setServicesError(
        fetchError.response?.data?.message ||
          "Unable to load your services right now."
      );
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchShop();
    fetchServices();
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

  const handleShopChange = (event) => {
    const { name, value } = event.target;
    setShopForm((current) => ({ ...current, [name]: value }));
  };

  const handleShopSubmit = async (event) => {
    event.preventDefault();

    if (!shop?.id) {
      setShopError("No laundry shop is available to update.");
      return;
    }

    try {
      setSavingShop(true);
      setShopError("");
      setShopSuccess("");
      const response = await apiClient.patch(`/laundries/${shop.id}`, {
        name: shopForm.name,
        address: shopForm.address,
        phone: shopForm.phone,
        openTime: shopForm.openTime,
        closeTime: shopForm.closeTime,
      });
      const updatedShop = response.data?.shop || shop;
      setShop(updatedShop);
      setShopForm({
        name: updatedShop?.name || "",
        address: updatedShop?.address || "",
        phone: updatedShop?.phone || "",
        openTime: updatedShop?.openTime || "",
        closeTime: updatedShop?.closeTime || "",
      });
      setShopSuccess("Shop profile updated successfully.");
    } catch (updateError) {
      console.error(updateError);
      setShopError(
        updateError.response?.data?.message ||
          "Unable to update your shop profile right now."
      );
    } finally {
      setSavingShop(false);
    }
  };

  const handleServiceFormChange = (event) => {
    const { name, value } = event.target;
    setServiceForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateService = async (event) => {
    event.preventDefault();

    if (!shop?.id) {
      setServicesError("Your laundry shop must exist before adding services.");
      return;
    }

    try {
      setServiceSubmitting(true);
      setServicesError("");
      setServiceSuccess("");
      const response = await apiClient.post("/services", {
        laundryShopId: Number(shop.id),
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        price: Number(serviceForm.price),
        unitType: serviceForm.unitType,
        estimatedTime: serviceForm.estimatedTime || undefined,
      });
      setServices((current) => [response.data?.service, ...current].filter(Boolean));
      setServiceForm(emptyServiceForm);
      setServiceSuccess("Service created successfully.");
    } catch (createError) {
      console.error(createError);
      setServicesError(
        createError.response?.data?.message ||
          "Unable to create the service right now."
      );
    } finally {
      setServiceSubmitting(false);
    }
  };

  const startEditingService = (service) => {
    setEditingServiceId(service.id);
    setEditingServiceForm({
      name: service?.name || "",
      description: service?.description || "",
      price: String(service?.price ?? ""),
      unitType: service?.unitType || "KG",
      estimatedTime: service?.estimatedTime || "",
    });
    setServiceSuccess("");
    setServicesError("");
  };

  const handleEditingServiceChange = (event) => {
    const { name, value } = event.target;
    setEditingServiceForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateService = async (serviceId) => {
    try {
      setUpdatingServiceId(serviceId);
      setServicesError("");
      setServiceSuccess("");
      const response = await apiClient.patch(`/services/${serviceId}`, {
        name: editingServiceForm.name,
        description: editingServiceForm.description || undefined,
        price: Number(editingServiceForm.price),
        unitType: editingServiceForm.unitType,
        estimatedTime: editingServiceForm.estimatedTime || undefined,
      });
      const updatedService = response.data?.service;
      setServices((current) =>
        current.map((service) =>
          service.id === serviceId ? updatedService || service : service
        )
      );
      setEditingServiceId(null);
      setEditingServiceForm(emptyServiceForm);
      setServiceSuccess("Service updated successfully.");
    } catch (updateError) {
      console.error(updateError);
      setServicesError(
        updateError.response?.data?.message ||
          "Unable to update the service right now."
      );
    } finally {
      setUpdatingServiceId(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      setDeletingServiceId(serviceId);
      setServicesError("");
      setServiceSuccess("");
      await apiClient.delete(`/services/${serviceId}`);
      setServices((current) =>
        current.filter((service) => service.id !== serviceId)
      );
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
        setEditingServiceForm(emptyServiceForm);
      }
      setServiceSuccess("Service deleted successfully.");
    } catch (deleteError) {
      console.error(deleteError);
      setServicesError(
        deleteError.response?.data?.message ||
          "Unable to delete the service right now."
      );
    } finally {
      setDeletingServiceId(null);
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
  const totalPaidRevenue = orders
    .filter((order) => order?.paymentStatus === "PAID")
    .reduce((sum, order) => sum + Number(order?.totalAmount || 0), 0);
  const pendingRevenue = orders
    .filter((order) => order?.paymentStatus === "PENDING")
    .reduce((sum, order) => sum + Number(order?.totalAmount || 0), 0);
  const completedPaidOrders = orders.filter(
    (order) =>
      order?.status === "COMPLETED" && order?.paymentStatus === "PAID"
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

  const revenueCards = [
    {
      label: "Total Paid Revenue",
      value: formatCurrency(totalPaidRevenue),
      tone: "text-lime",
    },
    {
      label: "Pending Revenue",
      value: formatCurrency(pendingRevenue),
      tone: "text-amber-200",
    },
    {
      label: "Completed Paid Orders",
      value: completedPaidOrders,
      tone: "text-aqua",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Laundry Owner"
        title="Run shop operations from one focused workspace."
        description="Review incoming customer orders, manage your shop profile, shape your service catalog, and keep the laundry workflow moving smoothly."
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

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {revenueCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <h2 className={`mt-3 text-3xl font-semibold ${card.tone}`}>
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Payment visibility for your current laundry shop workload.
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="panel p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                Shop Profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Manage your laundry shop
              </h2>
            </div>

            {shop?.status ? (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  shop.status === "ACTIVE"
                    ? "border-lime-400/30 bg-lime-500/10 text-lime-200"
                    : "border-slate-400/30 bg-slate-500/10 text-slate-200"
                }`}
              >
                {shop.status}
              </span>
            ) : null}
          </div>

          {shopLoading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
              Loading shop profile...
            </div>
          ) : null}

          {!shopLoading && shopError ? (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {shopError}
            </div>
          ) : null}

          {!shopLoading && shopSuccess ? (
            <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-500/10 p-4 text-sm text-lime-100">
              {shopSuccess}
            </div>
          ) : null}

          {!shopLoading && !shopError && shop ? (
            <form className="mt-6 space-y-4" onSubmit={handleShopSubmit}>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Shop Name
                </label>
                <input
                  name="name"
                  className="field"
                  value={shopForm.name}
                  onChange={handleShopChange}
                  disabled={savingShop}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Address
                </label>
                <textarea
                  name="address"
                  rows="3"
                  className="field resize-none"
                  value={shopForm.address}
                  onChange={handleShopChange}
                  disabled={savingShop}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Phone
                  </label>
                  <input
                    name="phone"
                    className="field"
                    value={shopForm.phone}
                    onChange={handleShopChange}
                    disabled={savingShop}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Status
                  </label>
                  <input
                    className="field"
                    value={shop.status || "N/A"}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Open Time
                  </label>
                  <input
                    type="time"
                    name="openTime"
                    className="field"
                    value={shopForm.openTime}
                    onChange={handleShopChange}
                    disabled={savingShop}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Close Time
                  </label>
                  <input
                    type="time"
                    name="closeTime"
                    className="field"
                    value={shopForm.closeTime}
                    onChange={handleShopChange}
                    disabled={savingShop}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Shop profile updates currently depend on backend owner
                permission for `PATCH /api/laundries/:id`. If the backend still
                restricts this route to admins, saving will return the backend
                permission message.
              </div>

              <button type="submit" className="btn-primary" disabled={savingShop}>
                {savingShop ? "Saving..." : "Save Shop Profile"}
              </button>
            </form>
          ) : null}
        </div>

        <div className="panel p-6 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Services Management
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Manage your service catalog
            </h2>
          </div>

          {servicesError ? (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {servicesError}
            </div>
          ) : null}

          {serviceSuccess ? (
            <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-500/10 p-4 text-sm text-lime-100">
              {serviceSuccess}
            </div>
          ) : null}

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateService}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Service Name
              </label>
              <input
                name="name"
                className="field"
                value={serviceForm.name}
                onChange={handleServiceFormChange}
                disabled={serviceSubmitting}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Unit Type
              </label>
              <select
                name="unitType"
                className="field"
                value={serviceForm.unitType}
                onChange={handleServiceFormChange}
                disabled={serviceSubmitting}
              >
                <option value="KG">KG</option>
                <option value="ITEM">ITEM</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                className="field resize-none"
                value={serviceForm.description}
                onChange={handleServiceFormChange}
                disabled={serviceSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={serviceForm.price}
                onChange={handleServiceFormChange}
                disabled={serviceSubmitting}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Estimated Time
              </label>
              <input
                name="estimatedTime"
                className="field"
                value={serviceForm.estimatedTime}
                onChange={handleServiceFormChange}
                disabled={serviceSubmitting}
                placeholder="24 hours"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="btn-primary"
                disabled={serviceSubmitting || !shop?.id}
              >
                {serviceSubmitting ? "Creating..." : "Add New Service"}
              </button>
            </div>
          </form>

          {servicesLoading ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
              Loading services...
            </div>
          ) : null}

          {!servicesLoading && services.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-slate-950/20 p-4 text-sm text-slate-300">
              No services added yet. Create your first service above.
            </div>
          ) : null}

          {!servicesLoading && services.length > 0 ? (
            <div className="mt-8 grid gap-4">
              {services.map((service) => {
                const isEditing = editingServiceId === service.id;

                return (
                  <div
                    key={service.id}
                    className="rounded-3xl border border-white/10 bg-slate-950/20 p-5"
                  >
                    {isEditing ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-slate-300">
                            Service Name
                          </label>
                          <input
                            name="name"
                            className="field"
                            value={editingServiceForm.name}
                            onChange={handleEditingServiceChange}
                            disabled={updatingServiceId === service.id}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-slate-300">
                            Unit Type
                          </label>
                          <select
                            name="unitType"
                            className="field"
                            value={editingServiceForm.unitType}
                            onChange={handleEditingServiceChange}
                            disabled={updatingServiceId === service.id}
                          >
                            <option value="KG">KG</option>
                            <option value="ITEM">ITEM</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm text-slate-300">
                            Description
                          </label>
                          <textarea
                            name="description"
                            rows="3"
                            className="field resize-none"
                            value={editingServiceForm.description}
                            onChange={handleEditingServiceChange}
                            disabled={updatingServiceId === service.id}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-slate-300">
                            Price
                          </label>
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            className="field"
                            value={editingServiceForm.price}
                            onChange={handleEditingServiceChange}
                            disabled={updatingServiceId === service.id}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-slate-300">
                            Estimated Time
                          </label>
                          <input
                            name="estimatedTime"
                            className="field"
                            value={editingServiceForm.estimatedTime}
                            onChange={handleEditingServiceChange}
                            disabled={updatingServiceId === service.id}
                          />
                        </div>

                        <div className="md:col-span-2 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="btn-primary"
                            disabled={updatingServiceId === service.id}
                            onClick={() => handleUpdateService(service.id)}
                          >
                            {updatingServiceId === service.id
                              ? "Saving..."
                              : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={updatingServiceId === service.id}
                            onClick={() => {
                              setEditingServiceId(null);
                              setEditingServiceForm(emptyServiceForm);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {service?.name || "Service"}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">
                              {service?.description || "No description provided."}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                              {service?.unitType || "UNIT"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                              {formatCurrency(service?.price)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Estimated Time
                            </p>
                            <p className="mt-2 text-base text-white">
                              {service?.estimatedTime || "Not specified"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Created
                            </p>
                            <p className="mt-2 text-base text-white">
                              {formatDate(service?.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => startEditingService(service)}
                          >
                            Edit Service
                          </button>
                          <button
                            type="button"
                            className="btn-secondary border-red-400/20 text-red-200 hover:border-red-400/40 hover:text-red-100"
                            disabled={deletingServiceId === service.id}
                            onClick={() => handleDeleteService(service.id)}
                          >
                            {deletingServiceId === service.id
                              ? "Deleting..."
                              : "Delete Service"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
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
