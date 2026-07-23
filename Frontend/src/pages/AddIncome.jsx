import React, { useState } from "react";
import { handleError, handleSuccess } from "../utils";
import "./AddIncome.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function AddIncome() {
  const navigate = useNavigate();

  // ── recurring toggle (new) ──
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const amount = e.target.amount.value;
    const category = e.target.category.value; // renamed from source to category in UI
    // Note: date is NOT extracted here — the date input is absent from the DOM
    // when isRecurring=true, so e.target.date would be undefined and crash.

    const token = localStorage.getItem("token");

    // ── if recurring checkbox is checked, create a recurring template ──
    if (isRecurring) {
      try {
        const response = await fetch(`${BASE_URL}/recurring/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify({
            type: "income",
            title,
            amount,
            source: category, // same field name as income.js (category in UI = source in model)
            frequency,
            startDate,
          }),
        });
        const data = await response.json();
        if (data.success) {
          handleSuccess("Recurring income created!");
          e.target.reset();
          setIsRecurring(false);
          setFrequency("monthly");
          setStartDate("");
          navigate("/dashboard");
        } else {
          handleError(data.message || "Failed to create recurring income");
        }
      } catch (err) {
        handleError("Internal server error");
      }
      return;
    }

    // ── otherwise, create a normal one-time income (existing logic unchanged) ──
    // Safe to read date here: input is rendered when isRecurring is false.
    const date = e.target.date.value;
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

  const frequencies = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div style={{ padding: "1rem" }}>
      <div className="add-income-container">
        <h2>{isRecurring ? "Add Recurring Income" : "Add Income"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Title — unchanged */}
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" name="title" className="form-control" required />
          </div>

          {/* Amount — unchanged */}
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              required
            />
          </div>

          {/* Category (source in model) — unchanged */}
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

          {/* Date — only shown for one-time income */}
          {!isRecurring && (
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                required
              />
            </div>
          )}

          {/* ── Recurring toggle checkbox ── */}
          <div className="recurring-toggle mb-3">
            <label className="recurring-toggle-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span>Make this a recurring income</span>
            </label>
          </div>

          {/* ── Recurring fields — shown only when checkbox is checked ── */}
          {isRecurring && (
            <div className="recurring-fields">
              <div className="mb-3">
                <label className="form-label">Frequency</label>
                <select
                  className="form-control"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            {isRecurring ? "Set as Recurring" : "Add Income"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIncome;
