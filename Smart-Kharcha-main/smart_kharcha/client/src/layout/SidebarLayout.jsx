import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SidebarLayout = ({ setIsLoggedIn }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 dark:text-white">

      <Header
        openSidebar={() => setSidebarOpen(true)}
        setIsLoggedIn={setIsLoggedIn}
      />

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex-grow flex flex-col relative">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default SidebarLayout;