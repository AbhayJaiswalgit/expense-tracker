import React, { useEffect } from "react";
import { useState } from "react";
import "./AllTransactions.css";

function AllTransactions() {
  const handleDelete = async (id, type) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/${type}/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        setAllTransactions((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      handleError("Error in Deleting");
    }
  };
  const [AllTransactions, setAllTransactions] = useState([]);

  const fetchAllTransactions = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8080/dashboard/allTransactions",
        {
          headers: { authorization: `${token}` },
        }
      );

      const alldata = await response.json();
      if (alldata.success) {
        setAllTransactions(alldata.data);
      }
    } catch (err) {
      handleError("Failed to Fetch Data");
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  return (
    <div className="transactions-container">
      <h4>All Transactions</h4>
      <ul className="transaction-list">
        {AllTransactions.map((t, index) => (
          <li
            key={index}
            className={`transaction-item ${
              t.type === "income" ? "income" : "expense"
            }`}
          >
            <div className="transaction-left">
              <span className="icon">{t.type === "income" ? "💰" : "💸"}</span>
              <div className="transaction-info">
                <div className="transaction-title">{t.title}</div>
                <div className="transaction-sub">
                  {t.type === "income"
                    ? `Source: ${t.source}`
                    : `Category: ${t.category}`}
                </div>
              </div>
            </div>

            <div className="amount-delete">
              <div className="transaction-right">
                <span className="amount">₹{t.amount}</span>
                <span className="date">
                  {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
              <button
                className="delete-btn"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this transaction?"
                    )
                  ) {
                    handleDelete(t._id, t.type);
                  }
                }}
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllTransactions;
