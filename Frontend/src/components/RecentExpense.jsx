import React from "react";
import "./TransactionList.css"; // Same shared style

function RecentExpense({ recentExpense }) {
  return (
    <div className="recent-section expense-section">
      <h4 className="text-center mb-3">Recent Expenses</h4>
      {recentExpense.length === 0 ? (
        <p className="text-center">No recent expense</p>
      ) : (
        <ul className="transaction-list expense-list">
          {recentExpense.map((item, index) => (
            <li key={index} className="transaction-card">
              <div className="transaction-icon">🧾</div>
              <div>
                <strong>{item.title}</strong>
                <p className="date">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <div className="amount text-danger">– ₹{item.amount}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentExpense;
