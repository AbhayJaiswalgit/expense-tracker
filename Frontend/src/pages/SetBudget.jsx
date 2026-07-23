import React, { useState, useEffect } from "react";
import { handleError, handleSuccess } from "../utils";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../config";

function SetBudget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [budgetType, setBudgetType] = useState("category"); // 'category' or 'overall'
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [suggestedAmount, setSuggestedAmount] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [budgetId, setBudgetId] = useState(null);
  const [allBudgets, setAllBudgets] = useState([]);

  useEffect(() => {
    fetchAllBudgets();
    if (location.state) {
      const { id, category, monthlyLimit, isOverall } = location.state;
      setBudgetId(id);
      setBudgetType(isOverall ? "overall" : "category");
      setCategory(isOverall ? "" : category);
      setMonthlyLimit(monthlyLimit);
      setIsEdit(true);
    }
  }, [location.state]);

  const fetchAllBudgets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/budget/current-month`, {
        headers: { authorization: token },
      });
      const data = await response.json();
      if (data.success) {
        setAllBudgets(data.budgets);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
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

  useEffect(() => {
    if (budgetType === "category" && category && !isEdit) {
      fetchCategoryAverage(category);
    } else {
      setSuggestedAmount(0);
    }
  }, [category, budgetType, isEdit]);

  const fetchCategoryAverage = async (selectedCategory) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${BASE_URL}/budget/category-average?category=${selectedCategory}`,
        {
          headers: { authorization: token },
        },
      );
      const data = await response.json();
      if (data.success) {
        setSuggestedAmount(data.average.toFixed(2));
        setMonthlyLimit(data.average.toFixed(2));
      } else {
        setSuggestedAmount(0);
        setMonthlyLimit("");
      }
    } catch (err) {
      handleError("Failed to fetch category average");
      setSuggestedAmount(0);
      setMonthlyLimit("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    const token = localStorage.getItem("token");
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Validation
    const categoryBudgets = allBudgets.filter(
      (b) => !b.isOverall && b._id !== budgetId,
    );
    const overallBudget = allBudgets.find(
      (b) => b.isOverall && b._id !== budgetId,
    );
    const sumCategoryBudgets = categoryBudgets.reduce(
      (sum, b) => sum + b.monthlyLimit,
      0,
    );

    if (budgetType === "overall") {
      if (limit < sumCategoryBudgets) {
        handleError(
          `Overall limit can't be less than ₹${sumCategoryBudgets}, the sum of your category budgets`,
        );
        return;
      }
    } else {
      if (
        overallBudget &&
        limit + sumCategoryBudgets > overallBudget.monthlyLimit
      ) {
        if (
          !window.confirm(
            `This will make the sum of category budgets (₹${
              limit + sumCategoryBudgets
            }) exceed your Overall budget (₹${
              overallBudget.monthlyLimit
            }). Continue?`,
          )
        ) {
          return;
        }
      }
    }

    try {
      const url = isEdit
        ? `${BASE_URL}/budget/update/${budgetId}`
        : `${BASE_URL}/budget/set`;
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        isOverall: budgetType === "overall",
        monthlyLimit: limit,
        month,
        year,
      };

      if (budgetType === "category") {
        payload.category = category;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        handleSuccess(data.message);
        navigate("/dashboard");
      } else {
        handleError(data.message);
      }
    } catch (err) {
      handleError("Internal server error");
    }
  };

  return (
    <div style={{ marginLeft: "250px", padding: "1rem" }}>
      <div className="set-budget-container">
        <h2>{isEdit ? "Edit Budget" : "Set Monthly Budget"}</h2>
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <div className="mb-3">
              <label className="form-label">Budget Type</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="budgetType"
                    id="typeCategory"
                    value="category"
                    checked={budgetType === "category"}
                    onChange={(e) => setBudgetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="typeCategory">
                    Specific Category
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="budgetType"
                    id="typeOverall"
                    value="overall"
                    checked={budgetType === "overall"}
                    onChange={(e) => setBudgetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="typeOverall">
                    Overall Monthly Limit
                  </label>
                </div>
              </div>
            </div>
          )}

          {budgetType === "category" && (
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isEdit}
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Monthly Limit</label>
            <input
              type="number"
              name="monthlyLimit"
              className="form-control"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              required
            />
            {budgetType === "category" &&
              category &&
              suggestedAmount > 0 &&
              !isEdit && (
                <small className="form-text text-muted">
                  Suggested: ₹{suggestedAmount} (average of last 3 months)
                </small>
              )}
          </div>

          <button type="submit" className="btn btn-primary">
            {isEdit ? "Update Budget" : "Set Budget"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetBudget;
