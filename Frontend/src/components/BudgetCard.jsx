import React from "react";
import "./BudgetCard.css";

const BudgetCard = ({
  id,
  category,
  monthlyLimit,
  spent,
  onDelete,
  onEdit,
  isOverall,
}) => {
  const percentage = (spent / monthlyLimit) * 100;

  let progressBarClass = "";
  if (percentage < 70) {
    progressBarClass = "bg-success";
  } else if (percentage >= 70 && percentage < 90) {
    progressBarClass = "bg-warning";
  } else {
    progressBarClass = "bg-danger";
  }

  return (
    <div
      className={`card budget-card ${isOverall ? "overall-budget-card" : ""}`}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">{category}</h5>
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => onEdit(id, category, monthlyLimit)}
            >
              ✏️
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(id)}
            >
              🗑️
            </button>
          </div>
        </div>
        {monthlyLimit > 0 ? (
          <>
            <p className="card-text">
              Spent: ₹{spent.toFixed(2)} / Limit: ₹{monthlyLimit.toFixed(2)}
            </p>
            <div className="progress" style={{ height: "10px" }}>
              <div
                className={`progress-bar ${progressBarClass}`}
                role="progressbar"
                style={{ width: `${Math.min(100, percentage)}%` }}
                aria-valuenow={percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <p className="card-text mt-2 text-muted">
              {percentage.toFixed(2)}% Used
            </p>
          </>
        ) : (
          <p className="card-text">
            No budget set for this category.{" "}
            <a href="#" className="set-budget-link">
              Set one
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
