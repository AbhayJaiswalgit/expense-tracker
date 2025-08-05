import { useEffect, useState } from "react";
import { handleError } from "../utils.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./Statistics.css"; // 👈 import the CSS
import { BASE_URL } from "../config.js";

function Statistics() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const COLORS = [
    "#FF6384", // Soft Red
    "#36A2EB", // Sky Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#00C49F", // Greenish Aqua
    "#C0C0C0", // Silver/Grey
  ];

  const groupByCategory = (data) => {
    const result = [];
    data.forEach((item) => {
      const existing = result.find((entry) => entry.category === item.category);
      if (existing) existing.amount += item.amount;
      else result.push({ category: item.category, amount: item.amount });
    });
    return result;
  };

  const groupBySources = (data) => {
    const result = [];
    data.forEach((item) => {
      const existing = result.find((entry) => entry.source === item.source);
      if (existing) existing.amount += item.amount;
      else result.push({ source: item.source, amount: item.amount });
    });
    return result;
  };

  const fetchChartData = async () => {
    const token = localStorage.getItem("token");
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    try {
      const incomeRes = await fetch(
        `${BASE_URL}/income/filterByDate?startDate=${start}&endDate=${end}`,
        {
          headers: { authorization: `${token}` },
        }
      );
      const expenseRes = await fetch(
        `${BASE_URL}/expense/filterByDate?startDate=${start}&endDate=${end}`,
        {
          headers: { authorization: `${token}` },
        }
      );

      const incomeJson = await incomeRes.json();
      const expenseJson = await expenseRes.json();

      const processedIncome = groupBySources(incomeJson.incomes);
      const processedExpense = groupByCategory(expenseJson.expenses);

      setIncomeData(processedIncome);
      setExpenseData(processedExpense);
    } catch (err) {
      handleError("Failed to fetch chart data");
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [startDate, endDate]);

  return (
    <div className="statistics mt-5">
      <h2 className="text-center mb-4">Statistics</h2>

      <div className="date-filters d-flex justify-content-center align-items-center mb-4 gap-4">
        <div>
          <label className="me-2 fw-semibold">From:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </div>
        <div>
          <label className="me-2 fw-semibold">To:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-box">
          <h5>Income Breakdown</h5>
          {incomeData.length > 0 ? (
            <PieChart width={350} height={350}>
              <Pie
                data={incomeData}
                dataKey="amount"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {incomeData.map((_, index) => (
                  <Cell
                    key={`cell-income-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p>No income data available</p>
          )}
        </div>

        <div className="chart-box">
          <h5>Expense Breakdown</h5>
          {expenseData.length > 0 ? (
            <PieChart width={350} height={350}>
              <Pie
                data={expenseData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {expenseData.map((_, index) => (
                  <Cell
                    key={`cell-expense-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p>No expense data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistics;
