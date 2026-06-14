import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import { getUser, isAuthenticated } from "../utils/authStorage.js";

const howItWorks = [
  {
    title: "Choose a laundry",
    description:
      "Browse active partners near you and compare availability before you book.",
  },
  {
    title: "Schedule pickup",
    description:
      "Set your pickup details in minutes and hand off the rest to PressGo.",
  },
  {
    title: "Track progress",
    description:
      "Watch every step from acceptance to washing and delivery in real time.",
  },
  {
    title: "Get delivery",
    description:
      "Receive fresh clothes back at your doorstep with clear order updates.",
  },
];

const cities = ["Kandy", "Colombo", "Galle", "Kurunegala", "Matara", "Jaffna"];

const dashboardPaths = {
  ADMIN: "/admin/dashboard",
  LAUNDRY_OWNER: "/owner/dashboard",
  CUSTOMER: "/customer/dashboard",
  DRIVER: "/driver/dashboard",
};

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

function HomePage() {
  const authenticated = isAuthenticated();
  const user = getUser();
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortOption, setSortOption] = useState("Recommended");

  useEffect(() => {
    let isMounted = true;

    const fetchLaundries = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/laundries/active");

        if (isMounted) {
          setLaundries(response.data?.shops || []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("Unable to load laundry shops right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLaundries();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLaundries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nextLaundries = laundries.filter((laundry) => {
      const matchesSearch =
        !normalizedSearch ||
        [laundry?.name, laundry?.address, laundry?.phone]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      if (!matchesSearch) {
        return false;
      }

      if (!openNowOnly) {
        return true;
      }

      return isShopOpenNow(laundry);
    });

    const sortedLaundries = [...nextLaundries];

    if (sortOption === "Name A-Z") {
      sortedLaundries.sort((left, right) =>
        (left?.name || "").localeCompare(right?.name || "")
      );
    }

    if (sortOption === "Opens Earliest") {
      sortedLaundries.sort((left, right) => {
        const leftOpen = getMinutesFromTime(left?.openTime);
        const rightOpen = getMinutesFromTime(right?.openTime);

        if (leftOpen === null && rightOpen === null) {
          return 0;
        }

        if (leftOpen === null) {
          return 1;
        }

        if (rightOpen === null) {
          return -1;
        }

        return leftOpen - rightOpen;
      });
    }

    if (sortOption === "Closes Latest") {
      sortedLaundries.sort((left, right) => {
        const leftClose = getMinutesFromTime(left?.closeTime);
        const rightClose = getMinutesFromTime(right?.closeTime);

        if (leftClose === null && rightClose === null) {
          return 0;
        }

        if (leftClose === null) {
          return 1;
        }

        if (rightClose === null) {
          return -1;
        }

        return rightClose - leftClose;
      });
    }

    return sortedLaundries;
  }, [laundries, openNowOnly, searchTerm, sortOption]);

  const quickActions = [
    {
      label: "Dashboard",
      to: dashboardPaths[user?.role] || "/customer/dashboard",
    },
    ...(user?.role === "CUSTOMER"
      ? [{ label: "Orders", to: "/customer/orders" }]
      : []),
    ...(user?.role === "ADMIN"
      ? [{ label: "Payments", to: "/admin/payments" }]
      : []),
  ];

  if (!authenticated) {
    return (
      <div className="space-y-10">
        <section className="panel overflow-hidden bg-mesh p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                PressGo
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Laundry service near you
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Schedule pickup, track washing, and get clean clothes delivered
                with PressGo.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <input
                  value={pickupAddress}
                  onChange={(event) => setPickupAddress(event.target.value)}
                  placeholder="Enter pickup address"
                  className="field flex-1"
                />
                <Link to="/login" className="btn-primary whitespace-nowrap">
                  Find Laundry
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-300">
                Already have an account?{" "}
                <Link to="/login" className="text-aqua transition hover:text-white">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="panel bg-white/8 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
                Fast, local, reliable
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <p className="text-sm text-slate-400">Pickup & washing</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    One seamless flow
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <p className="text-sm text-slate-400">Real-time updates</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    From order to delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {howItWorks.map((item) => (
            <article key={item.title} className="panel p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg text-aqua">
                •
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Partner with PressGo
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Grow your laundry business
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Reach more customers, manage orders efficiently, and scale your
              shop operations with PressGo.
            </p>
            <Link to="/register" className="btn-secondary mt-6">
              Register as Laundry Owner
            </Link>
          </article>

          <article className="panel p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Delivery Opportunities
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Deliver with PressGo
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Take delivery assignments, track pickup steps, and support a
              reliable laundry network across the city.
            </p>
            <Link to="/register" className="btn-secondary mt-6">
              Register as Driver
            </Link>
          </article>
        </section>

        <section className="panel p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
            Popular Cities
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Where PressGo is growing
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <div
                key={city}
                className="rounded-3xl border border-white/10 bg-slate-950/20 px-5 py-4 text-base font-medium text-white"
              >
                {city}
              </div>
            ))}
          </div>
        </section>

        <footer className="panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
              PressGo helps customers, laundries, and drivers stay in sync.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span>About</span>
              <span>Help</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden bg-mesh p-8 md:p-12">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Welcome back, {user?.name || "PressGo user"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Choose an active laundry shop and start your next order.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={
                  action.label === "Dashboard" ? "btn-primary" : "btn-secondary"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Active Discovery
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Available Laundry Shops
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Search by laundry name or address and jump straight into service
              selection.
            </p>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <label className="block xl:w-[28rem]">
              <span className="sr-only">Search laundries</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by laundry name, address, or phone"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aqua/40"
              />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(event) => setOpenNowOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950/40 text-aqua focus:ring-aqua/40"
                />
                Open now
              </label>

              <label className="block sm:w-52">
                <span className="sr-only">Sort laundries</span>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-aqua/40"
                >
                  <option>Recommended</option>
                  <option>Name A-Z</option>
                  <option>Opens Earliest</option>
                  <option>Closes Latest</option>
                </select>
              </label>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Showing {filteredLaundries.length} active laundries
          </p>
        </div>
      </section>

      {loading ? (
        <section className="panel p-6 text-sm text-slate-300">
          Loading available laundry shops...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {!loading && !error && filteredLaundries.length === 0 ? (
        <section className="panel p-6 text-sm text-slate-300">
          No active laundry shops matched your current filters.
        </section>
      ) : null}

      {!loading && !error && filteredLaundries.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {filteredLaundries.map((laundry) => (
            <article key={laundry.id} className="panel p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {laundry?.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {laundry?.address}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                  {laundry?.status || "ACTIVE"}
                </span>
              </div>

              <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Phone
                  </dt>
                  <dd className="mt-2 text-base text-white">
                    {laundry?.phone || "N/A"}
                  </dd>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Opening Hours
                  </dt>
                  <dd className="mt-2 text-base text-white">
                    {laundry?.openTime || "N/A"} - {laundry?.closeTime || "N/A"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    isShopOpenNow(laundry)
                      ? "border-lime-400/30 bg-lime-500/10 text-lime-200"
                      : "border-slate-400/30 bg-slate-500/10 text-slate-200"
                  }`}
                >
                  {isShopOpenNow(laundry) ? "Open now" : "Closed now"}
                </span>
              </div>

              <div className="mt-6">
                <Link to={`/laundries/${laundry.id}`} className="btn-secondary">
                  View Services
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default HomePage;
