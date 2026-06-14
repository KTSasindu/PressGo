import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";

const filterOptions = ["All", "ACTIVE", "INACTIVE"];

const emptyEditForm = {
  name: "",
  address: "",
  phone: "",
  openTime: "",
  closeTime: "",
  status: "ACTIVE",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

function ShopManagementPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingShopId, setEditingShopId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [updatingShopId, setUpdatingShopId] = useState(null);
  const [deletingShopId, setDeletingShopId] = useState(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/laundries/admin/all");
      setShops(response.data?.shops || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load laundry shops right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return shops.filter((shop) => {
      const matchesFilter =
        activeFilter === "All" || shop?.status === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [shop?.name, shop?.address, shop?.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch));
    });
  }, [activeFilter, searchTerm, shops]);

  const startEditingShop = (shop) => {
    setEditingShopId(shop.id);
    setEditForm({
      name: shop?.name || "",
      address: shop?.address || "",
      phone: shop?.phone || "",
      openTime: shop?.openTime || "",
      closeTime: shop?.closeTime || "",
      status: shop?.status || "ACTIVE",
    });
    setError("");
    setSuccessMessage("");
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateShop = async (shopId, payloadOverride) => {
    try {
      setUpdatingShopId(shopId);
      setError("");
      setSuccessMessage("");

      const payload = payloadOverride || {
        name: editForm.name,
        address: editForm.address,
        phone: editForm.phone,
        openTime: editForm.openTime,
        closeTime: editForm.closeTime,
        status: editForm.status,
      };

      const response = await apiClient.patch(`/laundries/${shopId}`, payload);
      const updatedShop = response.data?.shop;

      setShops((current) =>
        current.map((shop) => (shop.id === shopId ? updatedShop || shop : shop))
      );
      setEditingShopId(null);
      setEditForm(emptyEditForm);
      setSuccessMessage("Shop updated successfully.");
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to update this shop right now."
      );
    } finally {
      setUpdatingShopId(null);
    }
  };

  const handleStatusToggle = async (shop) => {
    const nextStatus = shop?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await handleUpdateShop(shop.id, { status: nextStatus });
  };

  const handleDeleteShop = async (shopId) => {
    const confirmed = window.confirm(
      "Delete this shop? The current backend will deactivate it."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingShopId(shopId);
      setError("");
      setSuccessMessage("");
      const response = await apiClient.delete(`/laundries/${shopId}`);

      setShops((current) =>
        current.map((shop) =>
          shop.id === shopId ? { ...shop, status: "INACTIVE" } : shop
        )
      );
      setSuccessMessage(
        response.data?.message || "Shop deactivated successfully."
      );
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError.response?.data?.message ||
          "Unable to delete this shop right now."
      );
    } finally {
      setDeletingShopId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin Shops"
        title="Manage the laundry shop network."
        description="Search shops, review owner details, update shop information, and control active or inactive status from one admin workspace."
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
            <span className="sr-only">Search shops</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by shop name, address, or phone"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
            />
          </label>
        </div>
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading laundry shops...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && successMessage ? (
        <section className="panel border border-lime-400/30 bg-lime-500/10 p-6 text-sm text-lime-100">
          {successMessage}
        </section>
      ) : null}

      {!loading && !error && filteredShops.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No laundry shops matched the current filter or search.
        </section>
      ) : null}

      {!loading && !error && filteredShops.length > 0 ? (
        <section className="grid gap-6">
          {filteredShops.map((shop) => {
            const isEditing = editingShopId === shop.id;

            return (
              <article key={shop.id} className="panel p-6 md:p-8">
                {isEditing ? (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                          Shop #{shop.id}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">
                          Edit Laundry Shop
                        </h2>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          editForm.status === "ACTIVE"
                            ? "border-lime-400/30 bg-lime-500/10 text-lime-200"
                            : "border-slate-400/30 bg-slate-500/10 text-slate-200"
                        }`}
                      >
                        {editForm.status}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Shop Name
                        </label>
                        <input
                          name="name"
                          className="field"
                          value={editForm.name}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Phone
                        </label>
                        <input
                          name="phone"
                          className="field"
                          value={editForm.phone}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm text-slate-300">
                          Address
                        </label>
                        <textarea
                          name="address"
                          rows="3"
                          className="field resize-none"
                          value={editForm.address}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Open Time
                        </label>
                        <input
                          type="time"
                          name="openTime"
                          className="field"
                          value={editForm.openTime}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
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
                          value={editForm.closeTime}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Status
                        </label>
                        <select
                          name="status"
                          className="field"
                          value={editForm.status}
                          onChange={handleEditFormChange}
                          disabled={updatingShopId === shop.id}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={updatingShopId === shop.id}
                        onClick={() => handleUpdateShop(shop.id)}
                      >
                        {updatingShopId === shop.id ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={updatingShopId === shop.id}
                        onClick={() => {
                          setEditingShopId(null);
                          setEditForm(emptyEditForm);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                          Shop #{shop.id}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">
                          {shop?.name || "Laundry shop"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-300">
                          {shop?.owner?.name || "Owner unavailable"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {shop?.owner?.email || "No owner email"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          shop?.status === "ACTIVE"
                            ? "border-lime-400/30 bg-lime-500/10 text-lime-200"
                            : "border-slate-400/30 bg-slate-500/10 text-slate-200"
                        }`}
                      >
                        {shop?.status || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Address
                        </p>
                        <p className="mt-2 text-base text-white">
                          {shop?.address || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Phone
                        </p>
                        <p className="mt-2 text-base text-white">
                          {shop?.phone || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Open / Close
                        </p>
                        <p className="mt-2 text-base text-white">
                          {shop?.openTime || "N/A"} - {shop?.closeTime || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Created
                        </p>
                        <p className="mt-2 text-base text-white">
                          {formatDate(shop?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => startEditingShop(shop)}
                      >
                        Edit Shop
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={updatingShopId === shop.id}
                        onClick={() => handleStatusToggle(shop)}
                      >
                        {updatingShopId === shop.id
                          ? "Updating..."
                          : shop?.status === "ACTIVE"
                            ? "Mark Inactive"
                            : "Mark Active"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary border-red-400/20 text-red-200 hover:border-red-400/40 hover:text-red-100"
                        disabled={deletingShopId === shop.id}
                        onClick={() => handleDeleteShop(shop.id)}
                      >
                        {deletingShopId === shop.id ? "Deleting..." : "Delete Shop"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

export default ShopManagementPage;
