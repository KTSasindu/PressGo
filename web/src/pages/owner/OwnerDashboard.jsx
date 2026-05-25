import PageHero from "../../components/PageHero.jsx";

function OwnerDashboard() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Laundry Owner"
        title="Run shop operations from one focused workspace."
        description="This owner dashboard is ready for service management, incoming orders, payments, and delivery coordination."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold text-white">Shop performance</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Add revenue summaries, order status breakdowns, and team productivity metrics here.</p>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold text-white">Next actions</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Use this space for alerts like unassigned pickups, delayed orders, and payment follow-ups.</p>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
