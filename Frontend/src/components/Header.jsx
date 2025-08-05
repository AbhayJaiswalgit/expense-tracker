import React, { useEffect, useState } from "react";
import "./Header.css";

const Header = () => {
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
      <h4 className="header-title">Expense Tracker</h4>
      {userName && <span className="header-user">Welcome, {userName}</span>}
    </header>
  );
};

export default Header;
