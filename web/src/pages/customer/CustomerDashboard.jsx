import PageHero from "../../components/PageHero.jsx";

function CustomerDashboard() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Customer"
        title="Manage orders, pickups, and payments."
        description="This dashboard shell can grow into order history, live status tracking, reorders, and review submission flows."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {["Active orders", "Saved addresses", "Pending reviews"].map((item) => (
          <div key={item} className="panel p-6">
            <p className="text-sm text-slate-400">Overview</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{item}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Placeholder card for the first customer dashboard widgets.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerDashboard;
