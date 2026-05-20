import { FaHeart, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-brand-dark border-t border-gray-100 dark:border-white/5 py-8 mt-auto z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Made with <FaHeart className="text-rose-500 animate-pulse" /> by Utkarsh & Vidush
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center">
          &copy; {new Date().getFullYear()} Smart Kharcha. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
