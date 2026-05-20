import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChartBar, FaCalendarCheck, FaLock, FaArrowRight, FaArrowUp, FaArrowDown, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const LandingPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const sync = () => {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      const isLogged = sessionStorage.getItem("isLoggedIn") === "true";
      if (savedUser && isLogged) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.state?.openLogin) {
      if (sessionStorage.getItem("logoutInProgress")) {
        // If we just logged out, ignore the auto-login prompt
        navigate("/", { replace: true, state: {} });
        return;
      }
      const timer = setTimeout(() => {
        setAuthMode("login");
      }, 0);
      navigate("/", { replace: true, state: {} });
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const handleEnterDashboard = () => {
    setIsEntering(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  const features = [
    {
      icon: <FaChartBar className="text-2xl text-indigo-600" />,
      title: "Detailed Analytics",
      desc: "Get crystal clear insights into your cash flow with automated monthly summaries and category breakdowns.",
    },
    {
      icon: <FaCalendarCheck className="text-2xl text-indigo-600" />,
      title: "Expense Calendar",
      desc: "Never lose track of a single paisa. A dedicated calendar view shows exactly where your money went, day by day.",
    },
    {
      icon: <FaLock className="text-2xl text-indigo-600" />,
      title: "Bank-Grade Security",
      desc: "Your data is yours alone. We use industry-standard encryption and secure MongoDB Atlas cloud hosting.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden transition-colors duration-500">
      
      {/* 🧊 Textured Background */}
      <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none transition-opacity duration-500" 
           style={{ 
             backgroundImage: darkMode 
               ? `radial-gradient(rgba(99, 102, 241, 0.4) 1px, transparent 1px)` 
               : `radial-gradient(#6366f1 1px, transparent 1px)`, 
             backgroundSize: '32px 32px' 
           }}>
      </div>

      {/* 🧭 Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.39 2.1-1.39 1.47 0 2.01.59 2.06 1.47h1.73c-.07-1.72-1.1-2.43-2.48-2.71V5h-2.1v2c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.33c.1 1.7 1.15 2.45 2.57 2.75V19h2.1v-2c1.55-.37 2.63-1.03 2.63-2.73 0-1.93-1.49-2.73-3.76-3.13z"/>
                </svg>
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-500 transition-all duration-300">
              Smart Kharcha
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Logged In as</span>
                  <span className="text-sm font-bold">{user.name}</span>
                </div>
                <button 
                  onClick={handleEnterDashboard}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                >
                  Dashboard <FaArrowRight size={12}/>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6 ml-2">
                <button onClick={() => setAuthMode('login')} className="text-sm font-semibold hover:text-indigo-600 transition-colors">Sign in</button>
                <button onClick={() => setAuthMode('register')} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">Get Started</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🚀 Hero Section */}
      <section className="pt-40 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {user ? (
            /* 👨‍💻 Personalized Hero for Auth Users */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center max-w-4xl mx-auto"
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-20 h-20 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 border border-indigo-600/20"
              >
                <FaUser size={32} />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Good to see you, <br />
                <span className="text-indigo-600">{user.name.split(' ')[0]}!</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Your finances are looking sharp. We've updated your stats and prepared your latest monthly overview. Ready to dive in?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 w-full max-w-xl mb-12">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center"><FaArrowUp /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Total Savings</p>
                        <p className="text-xl font-bold">₹41,550</p>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center"><FaChartBar /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Active Goals</p>
                        <p className="text-xl font-bold">3 Goals</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleEnterDashboard}
                className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95 group"
              >
                Enter Your Dashboard <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            /* 🌍 Public Hero Section */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Take Control of <br />
                <span className="text-indigo-600">Your Financial Future.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                Tracking your expenses shouldn't be a chore. Smart Kharcha is a minimal, high-performance tool designed for clarity and speed in 2026.
              </p>
              <div className="flex justify-center gap-4 mb-20">
                <button 
                  onClick={() => setAuthMode('register')}
                  className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  Start Tracking Now <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* 🖼️ Dashboard Preview / Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative lg:max-w-5xl mx-auto mt-20"
          >
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
               <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Income</p>
                  <p className="text-3xl font-bold">₹54,000</p>
                  <div className="mt-4 text-emerald-500 text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 w-fit px-2 py-1 rounded-md"><FaArrowUp size={10} /> +12%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Expense</p>
                  <p className="text-3xl font-bold">₹12,450</p>
                  <div className="mt-4 text-rose-500 text-xs font-bold flex items-center gap-1.5 bg-rose-500/10 w-fit px-2 py-1 rounded-md"><FaArrowDown size={10} /> -8%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget Health</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[65%]"></div>
                  </div>
                  <p className="text-xs mt-3 font-bold text-indigo-600">65% Used</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden text-left">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center"><span className="font-bold text-sm tracking-tight text-slate-400 uppercase">Recent Activity</span></div>
                 <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center opacity-70">
                       <div className="flex gap-4 items-center"><div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center"><FaArrowUp size={14}/></div><div><p className="text-sm font-bold">Freelance Project</p><p className="text-[10px] text-slate-400 font-medium">Income • Mar 22</p></div></div>
                       <span className="text-emerald-600 font-bold text-sm">+₹12,000</span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🧠 Core Features */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm hover:border-indigo-600/30 transition-all group">
                <div className="mb-6 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                <h3 className="text-lg font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
        </div>
      </section>

      {/* 📝 The Motivation */}
      <section className="py-32 px-6 border-t border-slate-100 dark:border-slate-800 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8">Our Motivation</h2>
          <blockquote className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-200 leading-[1.3] tracking-tight">
            "We built Smart Kharcha because we were tired of complex finance apps. We wanted something fast, cloud-synced, and brutally honest about our habits."
          </blockquote>
          <p className="mt-12 text-sm font-black text-indigo-600 tracking-tighter">— Vidush & Utkarsh, Founders</p>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 relative z-10 bg-white dark:bg-slate-950">
        Made with ❤️ by Utkarsh & Vidush
      </footer>

      {/* 🎭 Auth Overlay (Modal) */}
      <AnimatePresence>
        {authMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md" onClick={() => setAuthMode(null)}>
            <div className="w-full h-full absolute inset-0 cursor-zoom-out" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative z-10 w-full max-w-md"
            >
               {authMode === 'login' ? (
                 <LoginForm setIsLoggedIn={setIsLoggedIn} onClose={() => setAuthMode(null)} onSwitchToRegister={() => setAuthMode('register')} />
               ) : (
                 <RegisterForm setIsLoggedIn={setIsLoggedIn} onClose={() => setAuthMode(null)} onSwitchToLogin={() => setAuthMode('login')} />
               )}
               <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Cinematic Entrance Overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-indigo-600 flex items-center justify-center text-white p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center"
            >
               <motion.div 
                 animate={{ 
                   scale: [1, 1.1, 1],
                   opacity: [0.8, 1, 0.8]
                 }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-bold mb-8 mx-auto border border-white/30"
               >
                 S
               </motion.div>
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Syncing Your World...</h2>
               <p className="text-indigo-200 font-medium tracking-wide text-sm opacity-80 uppercase tracking-widest">Preparing Dashboard for {user?.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
