import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  clearAuthData,
  getUser,
  isAuthenticated,
} from "../utils/authStorage.js";
import NotificationBell from "./NotificationBell.jsx";

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();
  const dashboardPath =
    {
      ADMIN: "/admin/dashboard",
      LAUNDRY_OWNER: "/owner/dashboard",
      CUSTOMER: "/customer/dashboard",
      DRIVER: "/customer/dashboard",
    }[user?.role] || "/customer/dashboard";
  const navItems = authenticated
    ? [{ label: "Dashboard", to: dashboardPath }]
    : [
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];

  const handleLogout = () => {
    clearAuthData();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-aqua uppercase">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-mist">
            P
          </span>
          PressGo
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm transition",
                    isActive
                      ? "bg-white/12 text-white"
                      : "text-slate-300 hover:bg-white/6 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {authenticated ? <NotificationBell /> : null}

          {authenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/6 hover:text-white"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
