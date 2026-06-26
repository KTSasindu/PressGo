import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero.jsx";
import apiClient from "../../api/apiClient.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const filterOptions = ["All", "CUSTOMER", "LAUNDRY_OWNER", "DRIVER", "ADMIN"];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/admin/users");
      setUsers(response.data?.users || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError(getApiErrorMessage(fetchError, "Unable to load platform users right now."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesFilter =
        activeFilter === "All" || user?.role === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [user?.name, user?.email, user?.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch));
    });
  }, [activeFilter, searchTerm, users]);

  const handleRoleChange = async (userId, role) => {
    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccessMessage("");
      const response = await apiClient.patch(`/admin/users/${userId}/role`, {
        role,
      });
      const updatedUser = response.data?.user;
      setUsers((current) =>
        current.map((user) => (user.id === userId ? updatedUser || user : user))
      );
      setSuccessMessage("User role updated successfully.");
    } catch (updateError) {
      console.error(updateError);
      setError(getApiErrorMessage(updateError, "Unable to update this user's role right now."));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Delete this user? This action may be blocked if related records exist."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setError("");
      setSuccessMessage("");
      const response = await apiClient.delete(`/admin/users/${userId}`);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setSuccessMessage(response.data?.message || "User deleted successfully.");
    } catch (deleteError) {
      console.error(deleteError);
      setError(getApiErrorMessage(deleteError, "Unable to delete this user right now."));
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin Users"
        title="Manage platform users with clear role controls."
        description="Review platform accounts, search by contact details, filter by role, update access levels, and safely remove users when no related records block deletion."
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
            <span className="sr-only">Search users</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
            />
          </label>
        </div>
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading platform users...
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

      {!loading && !error && filteredUsers.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No users matched the current filter or search.
        </section>
      ) : null}

      {!loading && !error && filteredUsers.length > 0 ? (
        <section className="grid gap-6">
          {filteredUsers.map((user) => (
            <article key={user.id} className="panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                    User #{user.id}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {user?.name || "Account"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {user?.email || "No email"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {user?.phone || "No phone number"}
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                  {user?.role || "USER"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    ID
                  </p>
                  <p className="mt-2 text-base text-white">#{user?.id ?? "N/A"}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Role
                  </p>
                  <p className="mt-2 text-base text-white">
                    {user?.role || "USER"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Created
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Updated
                  </p>
                  <p className="mt-2 text-base text-white">
                    {formatDate(user?.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full lg:max-w-xs">
                  <label className="mb-2 block text-sm text-slate-300">
                    Change Role
                  </label>
                  <select
                    className="field"
                    value={user?.role || "CUSTOMER"}
                    disabled={updatingUserId === user.id}
                    onChange={(event) =>
                      handleRoleChange(user.id, event.target.value)
                    }
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="LAUNDRY_OWNER">LAUNDRY_OWNER</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-secondary border-red-400/20 text-red-200 hover:border-red-400/40 hover:text-red-100"
                  disabled={deletingUserId === user.id}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  {deletingUserId === user.id ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default UserManagementPage;
