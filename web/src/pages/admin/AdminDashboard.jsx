import PageHero from "../../components/PageHero.jsx";

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin"
        title="Monitor the full PressGo platform."
        description="Start with a calm command center for users, laundries, orders, payments, and delivery oversight."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {["Users", "Laundries", "Orders", "Revenue"].map((item) => (
          <div key={item} className="panel p-6">
            <p className="text-sm text-slate-400">Platform metric</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{item}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Reserved for backend-driven admin analytics and operational controls.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
