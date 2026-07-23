import React, { useEffect, useState } from "react";
import "./AllTransactions.css";
import { BASE_URL } from "../config";
import { handleError, handleSuccess } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Filter configuration — add new entries here to extend filtering in future
// Each entry: { value, label }
// ─────────────────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: "all", label: "All Transactions" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expenses" },
  { value: "recurring", label: "🔁 Recurring Transactions" },
];

const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Housing", "Utilities",
  "Health", "Education", "Insurance", "Entertainment", "Others",
];
const INCOME_SOURCES = [
  "Salary", "Freelance", "Investments", "Interest",
  "Bonus", "Scholarship", "Others",
];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

function AllTransactions() {
  // ── existing state ──
  const [allTransactions, setAllTransactions] = useState([]);

  // ── filter + recurring management state ──
  const [activeFilter, setActiveFilter] = useState("all");
  const [recurringList, setRecurringList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ── fetch all regular transactions (existing logic unchanged) ──
  const fetchAllTransactions = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/dashboard/allTransactions`, {
        headers: { authorization: `${token}` },
      });
      const alldata = await response.json();
      if (alldata.success) {
        setAllTransactions(alldata.data);
      }
    } catch (err) {
      handleError("Failed to fetch transactions");
    }
  };

  // ── fetch recurring templates ──
  const fetchRecurring = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/recurring/all`, {
        headers: { authorization: token },
      });
      const data = await response.json();
      if (data.success) setRecurringList(data.data);
    } catch (err) {
      handleError("Failed to fetch recurring transactions");
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    if (activeFilter === "recurring") fetchRecurring();
  }, [activeFilter]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived list — client-side filter for All / Income / Expense tabs
  // ─────────────────────────────────────────────────────────────────────────
  const visibleTransactions = allTransactions.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "income") return t.type === "income";
    if (activeFilter === "expense") return t.type === "expense";
    return true;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Delete a regular transaction (existing logic, unchanged)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDelete = async (id, type) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/${type}/${id}`, {
        method: "DELETE",
        headers: { authorization: `${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setAllTransactions((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      handleError("Error deleting transaction");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Recurring — Delete
  // ─────────────────────────────────────────────────────────────────────────
  const handleDeleteRecurring = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/recurring/${id}`, {
        method: "DELETE",
        headers: { authorization: token },
      });
      const result = await res.json();
      if (result.success) {
        handleSuccess("Recurring transaction deleted");
        setRecurringList((prev) => prev.filter((r) => r._id !== id));
      } else {
        handleError(result.message || "Failed to delete");
      }
    } catch (err) {
      handleError("Error deleting recurring transaction");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Recurring — Toggle Pause / Resume
  // ─────────────────────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/recurring/${id}/toggle`, {
        method: "PATCH",
        headers: { authorization: token },
      });
      const result = await res.json();
      if (result.success) {
        handleSuccess(result.message);
        setRecurringList((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, isActive: result.data.isActive } : r
          )
        );
      } else {
        handleError(result.message || "Failed to toggle status");
      }
    } catch (err) {
      handleError("Error toggling recurring transaction");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Recurring — Open / close inline edit form
  // ─────────────────────────────────────────────────────────────────────────
  const openEdit = (rt) => {
    setEditingId(rt._id);
    setEditForm({
      title: rt.title,
      amount: rt.amount,
      category: rt.category || "",
      source: rt.source || "",
      frequency: rt.frequency,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Recurring — Submit edit
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditSubmit = async (id, type) => {
    const token = localStorage.getItem("token");
    const payload = {
      title: editForm.title,
      amount: editForm.amount,
      frequency: editForm.frequency,
    };
    if (type === "expense") payload.category = editForm.category;
    if (type === "income") payload.source = editForm.source;

    try {
      const res = await fetch(`${BASE_URL}/recurring/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        handleSuccess("Recurring transaction updated");
        setRecurringList((prev) =>
          prev.map((r) => (r._id === id ? result.data : r))
        );
        closeEdit();
      } else {
        handleError(result.message || "Failed to update");
      }
    } catch (err) {
      handleError("Error updating recurring transaction");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: human-readable frequency label
  // ─────────────────────────────────────────────────────────────────────────
  const frequencyLabel = (f) =>
    ({ daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" }[f] || f);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="transactions-container">
      {/* ── Header row: title + filter dropdown ── */}
      <div className="transactions-header">
        <h4>Transactions</h4>

        {/* Generic filter dropdown — add to FILTER_OPTIONS to extend */}
        <div className="filter-dropdown-wrapper">
          <select
            id="transaction-filter"
            className="filter-dropdown"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setEditingId(null);
            }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Regular Transactions (All / Income / Expense filters)            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeFilter !== "recurring" && (
        <ul className="transaction-list">
          {visibleTransactions.length === 0 && (
            <li className="no-data">No transactions found.</li>
          )}
          {visibleTransactions.map((t, index) => (
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
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Recurring Transactions — manage existing (Edit / Pause / Delete) */}
      {/* Create recurring: use Add Income or Add Expense pages             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeFilter === "recurring" && (
        <>
          {/* Tip pointing users to the right place to create */}
          <p className="recurring-tip">
            💡 To create a recurring transaction, go to{" "}
            <strong>Add Income</strong> or <strong>Add Expense</strong> and
            check <em>"Make this a recurring transaction"</em>.
          </p>

          <ul className="transaction-list">
            {recurringList.length === 0 && (
              <li className="no-data">
                No recurring transactions yet.
              </li>
            )}

            {recurringList.map((rt) => (
              <React.Fragment key={rt._id}>
                {/* Card — reuses existing transaction-item layout */}
                <li
                  className={`transaction-item ${
                    rt.type === "income" ? "income" : "expense"
                  } ${rt.isActive ? "" : "paused-item"}`}
                >
                  {/* Left */}
                  <div className="transaction-left">
                    <span className="icon">🔁</span>
                    <div className="transaction-info">
                      <div className="transaction-title">{rt.title}</div>
                      <div className="transaction-sub">
                        {rt.type === "income"
                          ? `Source: ${rt.source}`
                          : `Category: ${rt.category}`}
                        {" · "}
                        <span className="badge-frequency">
                          {frequencyLabel(rt.frequency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="amount-delete">
                    <div className="transaction-right">
                      <span className="amount">₹{rt.amount}</span>
                      <span className="date">
                        Next: {new Date(rt.nextRunDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`badge-status ${
                          rt.isActive ? "status-active" : "status-paused"
                        }`}
                      >
                        {rt.isActive ? "Active" : "Paused"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="recurring-actions">
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() =>
                          editingId === rt._id ? closeEdit() : openEdit(rt)
                        }
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn toggle-btn"
                        title={rt.isActive ? "Pause" : "Resume"}
                        onClick={() => handleToggle(rt._id)}
                      >
                        {rt.isActive ? "⏸️" : "▶️"}
                      </button>
                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm("Delete this recurring transaction?")) {
                            handleDeleteRecurring(rt._id);
                          }
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </li>

                {/* Inline edit form — shown below the card when editing */}
                {editingId === rt._id && (
                  <li className="edit-form-wrapper">
                    <div className="recurring-form">
                      <h5 className="recurring-form-title">Edit Recurring</h5>

                      <div className="recurring-form-row">
                        <label>Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, title: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="recurring-form-row">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, amount: e.target.value }))
                          }
                          required
                        />
                      </div>

                      {rt.type === "expense" && (
                        <div className="recurring-form-row">
                          <label>Category</label>
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, category: e.target.value }))
                            }
                            required
                          >
                            <option value="">Select category</option>
                            {EXPENSE_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {rt.type === "income" && (
                        <div className="recurring-form-row">
                          <label>Source</label>
                          <select
                            value={editForm.source}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, source: e.target.value }))
                            }
                            required
                          >
                            <option value="">Select source</option>
                            {INCOME_SOURCES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="recurring-form-row">
                        <label>Frequency</label>
                        <select
                          value={editForm.frequency}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, frequency: e.target.value }))
                          }
                          required
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f} value={f}>{frequencyLabel(f)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="edit-form-actions">
                        <button
                          className="btn-save-recurring"
                          onClick={() => handleEditSubmit(rt._id, rt.type)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-cancel-recurring"
                          onClick={closeEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default AllTransactions;
