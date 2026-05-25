import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi.js";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
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

    try {
      await registerUser(formData);
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to register right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl panel p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
        Get started
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white">
        Create your PressGo account
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Register a new account and continue into PressGo with the role that
        fits your workflow.
      </p>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Full name</label>
          <input
            name="name"
            type="text"
            className="field"
            placeholder="Alex Perera"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Phone</label>
          <input
            name="phone"
            type="tel"
            className="field"
            placeholder="0771234567"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            name="email"
            type="email"
            className="field"
            placeholder="alex@pressgo.com"
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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Role</label>
          <select
            name="role"
            className="field"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="LAUNDRY_OWNER">LAUNDRY_OWNER</option>
            <option value="DRIVER">DRIVER</option>
          </select>
        </div>
        {errorMessage ? (
          <div className="md:col-span-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default RegisterPage;
