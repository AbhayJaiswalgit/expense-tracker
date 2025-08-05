import React from "react";
import { handleError, handleSuccess } from "../utils";
import "./AddIncome.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function AddIncome() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const amount = e.target.amount.value;
    const category = e.target.category.value; // renamed from source to category
    const date = e.target.date.value;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/income/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ title, amount, source: category, date }),
      });

      const data = await response.json();
      if (data.success) {
        handleSuccess("Income added successfully!");
        e.target.reset();
        navigate("/dashboard");
      } else {
        handleError("Failed to add income");
      }
    } catch (err) {
      handleError("Internal server error");
    }
  };

  // Predefined category options
  const categories = [
    "Salary",
    "Freelance",
    "Investments",
    "Interest",
    "Bonus",
    "Scholarship",
    "Others",
  ];

  return (
    <div style={{ marginLeft: "250px", padding: "1rem" }}>
      <div className="add-income-container">
        <h2>Add Income</h2>
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

          <button type="submit" className="btn btn-primary">
            Add Income
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIncome;
