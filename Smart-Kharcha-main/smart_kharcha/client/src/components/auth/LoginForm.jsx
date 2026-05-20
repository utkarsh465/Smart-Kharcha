import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";

const LoginForm = ({ setIsLoggedIn, onClose, onSwitchToRegister }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      sessionStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(data));
      setIsLoggedIn(true);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <motion.form
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onSubmit={handleLogin}
      className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-slate-200 dark:border-slate-800"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to manage your finances</p>
      </div>

      <div className="space-y-4">
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
        Sign In
      </button>

      <p className="text-sm text-center text-slate-500">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitchToRegister} className="text-indigo-600 font-bold hover:underline">
          Create one
        </button>
      </p>
    </motion.form>
  );
};

export default LoginForm;
