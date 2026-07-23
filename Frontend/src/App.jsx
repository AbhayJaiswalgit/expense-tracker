import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) {
      return saved === "true";
    }
    return window.innerWidth > 768;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", isSidebarOpen);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </>
  );
}
