import { useState, useContext, useRef, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ openSidebar, setIsLoggedIn }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  // Sync currentUser from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser"));
  });

  // Sync on window focus or storage change
  useEffect(() => {
    const syncUser = () => {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      setCurrentUser(user);
    };

    window.addEventListener("focus", syncUser);
    window.addEventListener("storage", syncUser);
    
    // Check every second as well for immediate local changes
    const interval = setInterval(syncUser, 1000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("focus", syncUser);
      window.removeEventListener("storage", syncUser);
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Set a flag to tell the LandingPage to ignore the openLogin signal for a moment
    sessionStorage.setItem("logoutInProgress", "true");
    
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    
    // Navigate home
    navigate("/", { replace: true });
    
    // Clear the flag after the transition is likely done
    setTimeout(() => sessionStorage.removeItem("logoutInProgress"), 500);
  };

  return (
    <div className="sticky top-0 z-40 bg-white/70 dark:bg-brand-dark/70 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between transition-colors duration-300">

      {/* Left Hamburger */}
      <button
        onClick={openSidebar}
        className="text-2xl text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-secondary hover:scale-110 transition-all duration-200"
      >
        <FaBars />
      </button>

      {/* Center Logo/Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/dashboard")}>
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-600 rounded-lg rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.39 2.1-1.39 1.47 0 2.01.59 2.06 1.47h1.73c-.07-1.72-1.1-2.43-2.48-2.71V5h-2.1v2c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.33c.1 1.7 1.15 2.45 2.57 2.75V19h2.1v-2c1.55-.37 2.63-1.03 2.63-2.73 0-1.93-1.49-2.73-3.76-3.13z"/>
            </svg>
          </div>
        </div>
        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-500 transition-all duration-300">
          Smart Kharcha
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* 🌙 Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl hover:rotate-180 transition-transform duration-300 mr-2"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {!currentUser && (
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block px-5 py-2 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md active:scale-95"
          >
            Sign In
          </button>
        )}

        {/* 👤 Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-secondary hover:scale-105 transition-all duration-200"
          >
            <FaUserCircle className="text-2xl" />
            <span className="text-xs font-semibold mt-1">{currentUser?.name || "Profile"}</span>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-44 bg-white dark:bg-brand-dark shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-white/10"
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-5 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200"
                >
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
                >
                  Logout
                </button>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Header;