import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div
      className="sidebar position-fixed top-0 start-0 bg-dark text-white p-3"
      style={{ width: "250px", height: "100vh", marginTop: "60px" }}
    >
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard">
            Dashboard
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/add-expense">
            Add Expense
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/add-income">
            Add Income
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/statistics">
            Statistics
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link
            className="nav-link text-white"
            to="/dashboard/all-Transactions"
          >
            Transactions History
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/login">
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
