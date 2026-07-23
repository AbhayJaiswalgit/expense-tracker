import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-md-none" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      <div
        className={`sidebar bg-dark text-white p-3 ${isOpen ? "sidebar-open" : ""}`}
      >
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dashboard" onClick={handleLinkClick}>
              Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dashboard/add-expense" onClick={handleLinkClick}>
              Add Expense
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dashboard/add-income" onClick={handleLinkClick}>
              Add Income
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dashboard/statistics" onClick={handleLinkClick}>
              Statistics
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              className="nav-link text-white"
              to="/dashboard/all-Transactions"
              onClick={handleLinkClick}
            >
              Transactions History
            </Link>
          </li>

          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/login" onClick={handleLinkClick}>
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
