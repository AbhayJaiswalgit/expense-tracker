import React from "react";
import { handleError, handleSuccess } from "../utils";
import "./AddExpense.css";
import { useNavigate } from "react-router-dom";

function AddExpense() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const amount = e.target.amount.value;
    const category = e.target.category.value; // renamed from source to category
    const date = e.target.date.value;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/expense/add", {
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

  // Predefined category options
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
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select name="category" className="form-control" required>
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input type="date" name="date" className="form-control" required />
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
