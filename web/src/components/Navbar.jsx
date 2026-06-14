import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  clearAuthData,
  getUser,
  isAuthenticated,
} from "../utils/authStorage.js";
import NotificationBell from "./NotificationBell.jsx";

function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authenticated = isAuthenticated();
  const user = getUser();
  const displayName = user?.name || "Account";
  const displayEmail = user?.email || "Signed-in session";
  const displayRole = user?.role || "USER";
  const dashboardPath =
    {
      ADMIN: "/admin/dashboard",
      LAUNDRY_OWNER: "/owner/dashboard",
      CUSTOMER: "/customer/dashboard",
      DRIVER: "/driver/dashboard",
    }[user?.role] || "/login";
  const ordersPath =
    {
      ADMIN: "/admin/dashboard",
      LAUNDRY_OWNER: "/owner/dashboard",
      CUSTOMER: "/customer/dashboard",
      DRIVER: "/driver/dashboard",
    }[user?.role] || "/login";
  const navItems = authenticated
    ? [
        { label: "Dashboard", to: dashboardPath },
        { label: "Orders", to: ordersPath },
        ...(user?.role === "ADMIN"
          ? [
              { label: "Payments", to: "/admin/payments" },
              { label: "Shops", to: "/admin/shops" },
              { label: "Users", to: "/admin/users" },
            ]
          : []),
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];

  const handleLogout = () => {
    clearAuthData();
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:border-aqua/40 hover:bg-white/10"
              aria-label="Open navigation menu"
            >
              ☰
            </button>

            <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-aqua uppercase">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-mist">
                P
              </span>
              PressGo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {!authenticated ? (
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
            ) : null}

            {authenticated ? <NotificationBell /> : null}
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-slate-950/92 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
                  PressGo
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Navigation
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:border-aqua/40 hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>

            {authenticated ? (
              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Signed in as</p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {displayName}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {displayEmail}
                </p>
                <p className="mt-4">
                  <span className="inline-flex items-center rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-aqua">
                    {displayRole}
                  </span>
                </p>
              </div>
            ) : null}

            <nav className="mt-8 flex flex-1 flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl border px-4 py-4 text-sm transition",
                      isActive
                        ? "border-aqua/30 bg-aqua/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {authenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-slate-300 transition hover:border-coral/40 hover:bg-white/8 hover:text-white"
              >
                Logout
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default Navbar;
