import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";

const RegisterForm = ({ setIsLoggedIn, onClose, onSwitchToLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    try {
      const { data } = await api.post("/auth/register", form);
      sessionStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(data));
      setIsLoggedIn(true);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Connection error");
    }
  };

  return (
    <motion.form
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onSubmit={handleRegister}
      className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-slate-200 dark:border-slate-800"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-slate-500 text-sm mt-1">Join Smart Kharcha today</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center font-bold bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
      >
        Sign Up
      </button>

      <p className="text-sm text-center text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-indigo-600 font-bold hover:underline">
          Sign In
        </button>
      </p>
    </motion.form>
  );
};

export default RegisterForm;
