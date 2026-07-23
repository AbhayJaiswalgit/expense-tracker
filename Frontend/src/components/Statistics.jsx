import { useEffect, useState } from "react";
import { handleError } from "../utils.jsx";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from "recharts";
import "./Statistics.css";
import { BASE_URL } from "../config.js";

function Statistics() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const COLORS = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#00C49F", "#C0C0C0",
  ];

  const fetchChartData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [incomeRes, expenseRes, trendsRes] = await Promise.all([
        fetch(`${BASE_URL}/income/source`, {
          headers: { authorization: `${token}` },
        }),
        fetch(`${BASE_URL}/expense/category`, {
          headers: { authorization: `${token}` },
        }),
        fetch(`${BASE_URL}/analytics/monthly-trends`, {
          headers: { authorization: `${token}` },
        })
      ]);

      const incomeJson = await incomeRes.json();
      const expenseJson = await expenseRes.json();
      const trendsJson = await trendsRes.json();

      if (incomeJson.success) setIncomeData(incomeJson.summary || []);
      if (expenseJson.success) setExpenseData(expenseJson.summary || []);
      if (trendsJson.success) setTrendData(trendsJson.trends || []);
      
    } catch (err) {
      handleError("Failed to fetch chart data");
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="statistics mt-5 pb-5">
      <h2 className="text-center mb-4">Analytics & Statistics</h2>

      <div className="chart-container">
        
        {/* Income vs Expense (Bar Chart) */}
        <div className="chart-box full-width-chart">
          <h5 className="mb-4">Monthly Income vs Expense</h5>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#00C49F" />
                <Bar dataKey="expense" name="Expense" fill="#FF6384" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No trend data available</p>
          )}
        </div>

        {/* Savings Trend (Line Chart) */}
        <div className="chart-box full-width-chart">
          <h5 className="mb-4">Monthly Savings Trend</h5>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="savings" name="Savings" stroke="#36A2EB" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No trend data available</p>
          )}
        </div>

        {/* Income Breakdown (Pie Chart) */}
        <div className="chart-box">
          <h5>Income Source Breakdown</h5>
          {incomeData.length > 0 ? (
            <PieChart width={350} height={350}>
              <Pie
                data={incomeData}
                dataKey="total"
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

        {/* Expense Breakdown (Pie Chart) */}
        <div className="chart-box">
          <h5>Expense Category Breakdown</h5>
          {expenseData.length > 0 ? (
            <PieChart width={350} height={350}>
              <Pie
                data={expenseData}
                dataKey="total"
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
