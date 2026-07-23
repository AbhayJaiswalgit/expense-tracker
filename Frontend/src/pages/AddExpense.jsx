import React, { useState } from "react";
import { handleError, handleSuccess } from "../utils";
import "./AddExpense.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function AddExpense() {
  const navigate = useNavigate();
  const [warning, setWarning] = useState("");

  const checkBudget = async (category, amount, date) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/budget/check-exceed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ category, amount: parseFloat(amount), date }),
      });
      const data = await response.json();
      if (data.success && data.willExceed) {
        const overAmount = data.spent + parseFloat(amount) - data.monthlyLimit;
        setWarning(
          `This will put you ₹${overAmount.toFixed(2)} over your ${
            data.category
          } budget this month.`,
        );
      } else {
        setWarning("");
      }
    } catch (err) {
      console.error("Budget check failed", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const amount = e.target.amount.value;
    const category = e.target.category.value;
    const date = e.target.date.value;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/expense/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ title, amount, category, date }),
      });

      const data = await response.json();
      if (data.success) {
        handleSuccess("Expense added successfully!", { autoClose: 1000 });
        e.target.reset();
        navigate("/dashboard");
      } else {
        handleError("Failed to add expense");
      }
    } catch (err) {
      handleError("Internal server error");
    }
  };

  const categories = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Health",
    "Education",
    "Insurance",
    "Entertainment",
    "Others",
  ];

  return (
    <div style={{ marginLeft: "250px", padding: "1rem" }}>
      <div className="add-expense-container">
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" name="title" className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              required
              onChange={(e) => {
                const category =
                  document.getElementsByName("category")[0].value;
                const date = document.getElementsByName("date")[0].value;
                if (category && date)
                  checkBudget(category, e.target.value, date);
              }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-control"
              required
              onChange={(e) => {
                const amount = document.getElementsByName("amount")[0].value;
                const date = document.getElementsByName("date")[0].value;
                if (amount && date) checkBudget(e.target.value, amount, date);
              }}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {warning && <div className="text-danger mt-2">{warning}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              required
              onChange={(e) => {
                const amount = document.getElementsByName("amount")[0].value;
                const category =
                  document.getElementsByName("category")[0].value;
                if (amount && category)
                  checkBudget(category, amount, e.target.value);
              }}
            />
          </div>

          <button type="submit" className="btn btn-danger">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
