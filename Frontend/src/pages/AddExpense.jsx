import React, { useState } from "react";
import { handleError, handleSuccess } from "../utils";
import "./AddExpense.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function AddExpense() {
  const navigate = useNavigate();
  const [warning, setWarning] = useState("");

  // ── recurring toggle (new) ──
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("");

  // ── existing budget-check logic (unchanged) ──
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
            type: "expense",
            title,
            amount,
            category,   // same field name as expense.js
            frequency,
            startDate,
          }),
        });
        const data = await response.json();
        if (data.success) {
          handleSuccess("Recurring expense created!");
          e.target.reset();
          setIsRecurring(false);
          setFrequency("monthly");
          setStartDate("");
          navigate("/dashboard");
        } else {
          handleError(data.message || "Failed to create recurring expense");
        }
      } catch (err) {
        handleError("Internal server error");
      }
      return;
    }

    // ── otherwise, create a normal one-time expense (existing logic unchanged) ──
    // Safe to read date here: input is rendered when isRecurring is false.
    const date = e.target.date.value;
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

  const frequencies = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div style={{ padding: "1rem" }}>
      <div className="add-expense-container">
        <h2>{isRecurring ? "Add Recurring Expense" : "Add Expense"}</h2>
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
              onChange={(e) => {
                if (!isRecurring) {
                  const category =
                    document.getElementsByName("category")[0].value;
                  const date = document.getElementsByName("date")[0].value;
                  if (category && date)
                    checkBudget(category, e.target.value, date);
                }
              }}
            />
          </div>

          {/* Category — unchanged */}
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-control"
              required
              onChange={(e) => {
                if (!isRecurring) {
                  const amount =
                    document.getElementsByName("amount")[0].value;
                  const date = document.getElementsByName("date")[0].value;
                  if (amount && date)
                    checkBudget(e.target.value, amount, date);
                }
              }}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {warning && !isRecurring && (
              <div className="text-danger mt-2">{warning}</div>
            )}
          </div>

          {/* Date — only shown for one-time expenses */}
          {!isRecurring && (
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                required
                onChange={(e) => {
                  const amount =
                    document.getElementsByName("amount")[0].value;
                  const category =
                    document.getElementsByName("category")[0].value;
                  if (amount && category)
                    checkBudget(category, amount, e.target.value);
                }}
              />
            </div>
          )}

          {/* ── Recurring toggle checkbox ── */}
          <div className="recurring-toggle mb-3">
            <label className="recurring-toggle-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  setWarning("");
                }}
              />
              <span>Make this a recurring expense</span>
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

          <button type="submit" className="btn btn-danger">
            {isRecurring ? "Set as Recurring" : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
