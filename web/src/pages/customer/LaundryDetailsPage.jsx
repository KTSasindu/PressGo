import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/apiClient.js";

function LaundryDetailsPage() {
  const { id } = useParams();
  const [laundry, setLaundry] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("Unable to load laundry details right now.");
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
      <section className="panel p-8 text-sm text-slate-300">
        Loading laundry details...
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
      <section className="panel p-8 text-sm text-slate-300">
        Laundry shop not found.
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="panel bg-mesh p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Laundry Partner
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              {laundry.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {laundry.address}
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-lime/30 bg-lime/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            {laundry.status}
          </span>
        </div>

        <dl className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Phone
            </dt>
            <dd className="mt-2 text-base text-white">{laundry.phone}</dd>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Opens
            </dt>
            <dd className="mt-2 text-base text-white">
              {laundry.openTime || "N/A"}
            </dd>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Closes
            </dt>
            <dd className="mt-2 text-base text-white">
              {laundry.closeTime || "N/A"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
            Services
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Available Services
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            Review the services currently offered by this laundry shop before
            placing an order.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="panel p-6 text-sm text-slate-300">
            No services are available for this laundry shop yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <article key={service.id} className="panel p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {service.description || "No description available."}
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-aqua">
                    {service.unitType}
                  </span>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Price
                    </dt>
                    <dd className="mt-2 text-base text-white">
                      Rs. {service.price}
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Estimated Time
                    </dt>
                    <dd className="mt-2 text-base text-white">
                      {service.estimatedTime || "N/A"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <button
                    type="button"
                    className="btn-secondary disabled:cursor-not-allowed disabled:opacity-80"
                    onClick={() => alert("Order flow coming next")}
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
  );
}

export default LaundryDetailsPage;
