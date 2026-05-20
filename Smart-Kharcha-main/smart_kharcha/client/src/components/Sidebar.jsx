import { NavLink } from "react-router-dom";
import { FaCamera } from "react-icons/fa";
import {
  FaHome,
  FaCalendarAlt,
  FaInfoCircle,
  FaQuestionCircle,
  FaTimes,
} from "react-icons/fa";

const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-white/5 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Smart Kharcha
          </h2>
          <button
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
            onClick={() => setOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2 mt-2 font-medium">

          <NavLink
            to="/dashboard"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <FaHome size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/calendar"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <FaCalendarAlt size={18} />
            Expense Calendar
          </NavLink>

          <NavLink
            to="/scanner"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <FaCamera size={18} />
            Receipt Scanner
          </NavLink>

          <div className="my-4 border-t border-gray-100 dark:border-white/5 mx-4"></div>

          <NavLink
            to="/how-to-use"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <FaQuestionCircle size={18} />
            How To Use
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <FaInfoCircle size={18} />
            About Us
          </NavLink>

        </nav>
      </div>
    </>
  );
};

export default Sidebar;