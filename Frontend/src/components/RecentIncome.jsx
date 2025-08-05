import React from "react";
import "./TransactionList.css"; // New CSS file to hold styles

function RecentIncome({ recentIncome }) {
  return (
    <div className="recent-section income-section">
      <h4 className="text-center mb-3">Recent Incomes</h4>
      {recentIncome.length === 0 ? (
        <p className="text-center">No recent income</p>
      ) : (
        <ul className="transaction-list income-list">
          {recentIncome.map((item, index) => (
            <li key={index} className="transaction-card">
              <div className="transaction-icon">💸</div>
              <div>
                <strong>{item.title}</strong>
                <p className="date">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <div className="amount text-success">+ ₹{item.amount}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentIncome;
