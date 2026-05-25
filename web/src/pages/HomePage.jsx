import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import PageHero from "../components/PageHero.jsx";

const highlights = [
  "Track orders, pickups, payments, and reviews in one place.",
  "Separate dashboards for customers, laundry owners, and admins.",
  "Built to pair with the PressGo Express + Prisma backend.",
];

function HomePage() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Laundry Aggregation Platform"
        title="A fast, modern frontend shell for the PressGo platform."
        description="This React app is the starting point for customer ordering, laundry-owner operations, and platform administration."
        actions={[
          <Link key="login" to="/login" className="btn-primary">
            Sign in
          </Link>,
          <Link key="register" to="/register" className="btn-secondary">
            Create account
          </Link>,
        ]}
      />

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item} className="panel p-6">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-aqua">
              •
            </div>
            <p className="text-sm leading-7 text-slate-300">{item}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime">
              Live from PressGo
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Available Laundry Shops
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Browse active laundry partners connected to the real backend API.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="panel p-6 text-sm text-slate-300">
            Loading available laundry shops...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="panel border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && laundries.length === 0 ? (
          <div className="panel p-6 text-sm text-slate-300">
            No active laundry shops are available yet.
          </div>
        ) : null}

        {!loading && !error && laundries.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {laundries.map((laundry) => (
              <article key={laundry.id} className="panel p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {laundry.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {laundry.address}
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                    {laundry.status}
                  </span>
                </div>

                <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Phone
                    </dt>
                    <dd className="mt-2 text-base text-white">{laundry.phone}</dd>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Opening Hours
                    </dt>
                    <dd className="mt-2 text-base text-white">
                      {laundry.openTime || "N/A"} - {laundry.closeTime || "N/A"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <Link
                    to={`/laundries/${laundry.id}`}
                    className="btn-secondary"
                  >
                    View Services
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default HomePage;
