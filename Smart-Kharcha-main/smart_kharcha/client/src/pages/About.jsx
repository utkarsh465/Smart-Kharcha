import React from "react";
import { FaCode, FaServer, FaHeart, FaRocket, FaLinkedin } from "react-icons/fa";
import utkarshPhoto from "../assets/utkarsh.jpg";
import vidushPhoto from "../assets/vidush.jpeg";

const About = () => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 w-full">

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-800 dark:text-white">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Smart Kharcha</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          More than just an expense tracker. We built Smart Kharcha to help you regain control over your financial life through simplicity, smart insights, and seamless tracking.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-brand-primary/5 p-8 rounded-full group-hover:bg-brand-primary/10 transition-colors">
            <FaRocket className="text-brand-primary text-4xl opacity-50" />
          </div>
          <h2 className="text-2xl font-display font-semibold mb-3">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            To provide a completely free, fast, and secure way for individuals to track their daily expenses and manage their monthly budgets without the clutter of complex financial apps.
          </p>
        </div>

        <div className="bg-white dark:bg-brand-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-rose-500/5 p-8 rounded-full group-hover:bg-rose-500/10 transition-colors">
            <FaHeart className="text-rose-500 text-4xl opacity-50" />
          </div>
          <h2 className="text-2xl font-display font-semibold mb-3">Why We Built It</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            We realized that keeping track of money shouldn't feel like a chore. Smart Kharcha was born out of the need for a beautiful, responsive tool that works directly in your browser.
          </p>
        </div>
      </div>

      {/* Meet the Team */}
      <div className="space-y-8 pt-6">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Meet the Developers</h2>
          <p className="text-slate-500 mt-2">The passionate minds behind Smart Kharcha</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto perspective-1000">

          {/* Backend Developer Card */}
          <div className="relative w-full h-80 group [perspective:1000px]">
            <div className="w-full h-full relative transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm border border-gray-100 dark:border-white/5 rounded-3xl cursor-pointer">

              {/* Front side */}
              <div className="absolute inset-0 w-full h-full backface-hidden [backface-visibility:hidden] bg-white dark:bg-brand-dark rounded-3xl p-6 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <FaServer className="text-emerald-500 text-3xl" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Utkarsh Raj</h3>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mt-2 mb-4">
                  Backend Developer
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Architected the data logic, ensuring that your financial data is processed securely and efficiently.
                </p>
              </div>

              {/* Back side */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-brand-dark rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-lg border border-emerald-200 dark:border-emerald-900/50">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md mb-4 bg-slate-200 flex items-center justify-center">
                  <img src={utkarshPhoto} alt="Utkarsh Raj" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Utkarsh Raj</h3>
                <p className="text-emerald-500 text-sm font-medium mb-3">Node.js & Database Pro</p>
                <a
                  href="https://www.linkedin.com/in/utkarsh-raj-a91b83245/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full transition-colors font-medium text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaLinkedin className="text-lg" />
                  Connect
                </a>
              </div>

            </div>
          </div>

          {/* Frontend Developer Card */}
          <div className="relative w-full h-80 group [perspective:1000px]">
            <div className="w-full h-full relative transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm border border-gray-100 dark:border-white/5 rounded-3xl cursor-pointer">

              {/* Front side */}
              <div className="absolute inset-0 w-full h-full backface-hidden [backface-visibility:hidden] bg-white dark:bg-brand-dark rounded-3xl p-6 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <FaCode className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Vidush Prakash Sinha</h3>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mt-2 mb-4">
                  Frontend Developer
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Crafted the beautiful, responsive user interface and implemented the core client-side logic securely.
                </p>
              </div>

              {/* Back side */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-brand-dark rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-lg border border-blue-200 dark:border-blue-900/50">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md mb-4 bg-slate-200 flex items-center justify-center">
                  <img src={vidushPhoto} alt="Vidush Prakash Sinha" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white">Vidush Prakash Sinha</h3>
                <p className="text-brand-primary text-sm font-medium mb-3">UI/UX & React Expert</p>
                <a
                  href="https://www.linkedin.com/in/vidush-prakash-sinha-a2596a244/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full transition-colors font-medium text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaLinkedin className="text-lg" />
                  Connect
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default About;