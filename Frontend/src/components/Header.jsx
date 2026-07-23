import React, { useEffect, useState } from "react";
import "./Header.css";

const Header = ({ toggleSidebar }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Retrieve user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const { name } = JSON.parse(storedUser);
        setUserName(name);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  return (
    <header className="header">
      <div className="d-flex align-items-center">
        <button 
          className="btn btn-outline-light d-md-none me-2 p-1" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          style={{ border: 'none', background: 'transparent' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
        <h4 className="header-title">Expense Tracker</h4>
      </div>
      {userName && <span className="header-user d-none d-sm-inline">Welcome, {userName}</span>}
    </header>
  );
};

export default Header;
