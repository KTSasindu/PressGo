import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

function MainLayout() {
  return (
    <div className="min-h-screen text-mist">
      <Navbar />
      <main className="shell py-10 md:py-14">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
