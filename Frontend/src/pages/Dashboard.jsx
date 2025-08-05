import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import RecentIncome from "../components/RecentIncome";
import RecentExpense from "../components/RecentExpense";
import { Link } from "react-router-dom";

function Dashboard() {
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [countIncome, setCountIncome] = useState(0);
  const [countExpense, setCountExpense] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8080/dashboard/summary",
          {
            headers: { authorization: `${token}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setRecentExpense(data.recent.expenses);
          setRecentIncome(data.recent.income);
          setNetBalance(data.summary.netBalance);
        }

        const incomeres = await fetch(
          "http://localhost:8080/income/monthincome",
          {
            headers: { authorization: `${token}` },
          }
        );

        const incomedata = await incomeres.json();
        console.log(incomedata);
        if (incomedata.success) {
          setIncome(incomedata.total);
          setMonth(incomedata.month);
          setYear(incomedata.year);
          setCountIncome(incomedata.count);
        }

        const expenseres = await fetch(
          "http://localhost:8080/expense/monthexpense",
          {
            headers: { authorization: `${token}` },
          }
        );

        const expensedata = await expenseres.json();
        if (expensedata.success) {
          setExpense(expensedata.total);
          setCountExpense(expensedata.count);
        }
      } catch (err) {
        console.log("Failer to fetch dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, []);

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
