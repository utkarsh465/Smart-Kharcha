import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SidebarLayout from "./layout/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";

import HowToUse from "./pages/HowToUse";
import About from "./pages/About";

import ReceiptScannerPage from "./pages/ReceiptScannerPage";

import LandingPage from "./pages/LandingPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  return (
    <Routes>
      {/* Landing Page (Entry point for Login/Register Overlays) */}
      <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />

      {/* Protected Routes */}
      <Route
        element={
          isLoggedIn ? (
            <SidebarLayout setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <Navigate to="/" state={{ openLogin: true }} />
          )
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/scanner" element={<ReceiptScannerPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Catch-all redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;