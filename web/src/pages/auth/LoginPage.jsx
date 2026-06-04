import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi.js";
import { saveAuthData } from "../../utils/authStorage.js";

const roleRedirects = {
  ADMIN: "/admin/dashboard",
  LAUNDRY_OWNER: "/owner/dashboard",
  CUSTOMER: "/customer/dashboard",
  DRIVER: "/driver/dashboard",
};

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    console.log("Login request started");

    try {
      const data = await loginUser(formData);
      saveAuthData(data.token, data.user);
      console.log("Login successful");
      navigate(roleRedirects[data.user?.role] || "/customer/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.log("Login failed");
      setErrorMessage(
        error.response?.data?.message || "Unable to login. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl panel p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
        Welcome back
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white">
        Login to PressGo
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Access customer, laundry-owner, and admin tools from a single secure
        platform.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            name="email"
            type="email"
            className="field"
            placeholder="admin@pressgo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input
            name="password"
            type="password"
            className="field"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
