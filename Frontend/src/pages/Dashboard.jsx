import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import RecentIncome from "../components/RecentIncome";
import BudgetCard from "../components/BudgetCard";
import RecentExpense from "../components/RecentExpense";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { handleError, handleSuccess } from "../utils";

function Dashboard() {
  const navigate = useNavigate();
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [countIncome, setCountIncome] = useState(0);
  const [countExpense, setCountExpense] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [budgets, setBudgets] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/dashboard/summary`, {
        headers: { authorization: `${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRecentExpense(data.recent.expenses);
        setRecentIncome(data.recent.income);
        setNetBalance(data.summary.netBalance);
      }

      const budgetRes = await fetch(`${BASE_URL}/budget/current-month`, {
        headers: { authorization: `${token}` },
      });
      const budgetData = await budgetRes.json();
      if (budgetData.success) {
        setBudgets(budgetData.budgets);
      }

      const incomeres = await fetch(`${BASE_URL}/income/monthincome`, {
        headers: { authorization: `${token}` },
      });

      const incomedata = await incomeres.json();
      if (incomedata.success) {
        setIncome(incomedata.total);
        setMonth(incomedata.month);
        setYear(incomedata.year);
        setCountIncome(incomedata.count);
      }

      const expenseres = await fetch(`${BASE_URL}/expense/monthexpense`, {
        headers: { authorization: `${token}` },
      });

      const expensedata = await expenseres.json();
      if (expensedata.success) {
        setExpense(expensedata.total);
        setCountExpense(expensedata.count);
      }
    } catch (err) {
      console.log("Failer to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/budget/delete/${id}`, {
        method: "DELETE",
        headers: { authorization: token },
      });
      const data = await response.json();
      if (data.success) {
        handleSuccess(data.message);
        fetchDashboardData();
      } else {
        handleError(data.message);
      }
    } catch (err) {
      handleError("Internal server error");
    }
  };

  const handleEditBudget = (id, category, monthlyLimit, isOverall) => {
    navigate("/dashboard/set-budget", {
      state: { id, category, monthlyLimit, isOverall },
    });
  };

  return (
    <>
      <div
        className="main-content"
        style={{ marginLeft: "250px", padding: "1rem" }}
      >
        <div className="income-expenses">
          <div className="income">
            <div className="card text-bg-success" style={{ width: "18rem" }}>
              <div className="card-body">
                <h5 className="card-title">
                  Total Income ({month},{year})
                </h5>
                <p className="card-text fs-4">₹{income}</p>
                <Link
                  to="/dashboard/add-income"
                  className="card-link text-white"
                >
                  ➕ Add Income
                </Link>
              </div>
            </div>
          </div>

          <div className="expense">
            <div className="card text-bg-danger" style={{ width: "18rem" }}>
              <div className="card-body">
                <h5 className="card-title">
                  Total Expense ({month},{year})
                </h5>
                <p className="card-text fs-4">₹{expense}</p>
                <Link
                  to="/dashboard/add-expense"
                  className="card-link text-white"
                >
                  ➕ Add Expense
                </Link>
              </div>
            </div>
          </div>

          <div className="net-balance">
            <div
              className={`card ${
                income - expense >= 0 ? "text-bg-success" : "text-bg-danger"
              }`}
              style={{ width: "18rem" }}
            >
              <div className="card-body">
                <h5 className="card-title">Net Balance (Till Date)</h5>
                <p className="card-text fs-4">₹{netBalance}</p>
              </div>
            </div>
          </div>

          <div className="transactions">
            <div className="card text-bg-info" style={{ width: "18rem" }}>
              <div className="card-body">
                <h5 className="card-title">
                  Number of Transactions ({month},{year})
                </h5>
                <p className="card-text fs-4">{countIncome + countExpense}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="budget-summary mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Monthly Budgets</h4>
            <Link to="/dashboard/set-budget" className="btn btn-primary">
              + Set Budget
            </Link>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {budgets.length > 0 ? (
              <>
                {budgets
                  .filter((b) => b.isOverall)
                  .map((budget) => (
                    <BudgetCard
                      key={budget._id}
                      id={budget._id}
                      category={budget.isOverall ? "Overall" : budget.category}
                      isOverall={budget.isOverall}
                      monthlyLimit={budget.monthlyLimit}
                      spent={budget.spent}
                      onDelete={handleDeleteBudget}
                      onEdit={(id, cat, limit) =>
                        handleEditBudget(id, cat, limit, budget.isOverall)
                      }
                    />
                  ))}
                {budgets
                  .filter((b) => !b.isOverall)
                  .map((budget) => (
                    <BudgetCard
                      key={budget._id}
                      id={budget._id}
                      category={budget.isOverall ? "Overall" : budget.category}
                      isOverall={budget.isOverall}
                      monthlyLimit={budget.monthlyLimit}
                      spent={budget.spent}
                      onDelete={handleDeleteBudget}
                      onEdit={(id, cat, limit) =>
                        handleEditBudget(id, cat, limit, budget.isOverall)
                      }
                    />
                  ))}
              </>
            ) : (
              <p>
                No budgets set for this month.{" "}
                <Link to="/dashboard/set-budget">Set one</Link>
              </p>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between flex-wrap gap-3">
          <div className="flex-fill" style={{ minWidth: "300px" }}>
            <RecentIncome recentIncome={recentIncome} />
          </div>
          <div className="flex-fill" style={{ minWidth: "300px" }}>
            <RecentExpense recentExpense={recentExpense} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
