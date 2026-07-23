import { useEffect, useState } from "react";
import { handleError } from "../utils.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  // Default to current month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const token = localStorage.getItem("token");

      let summaryIncome = 0;
      let summaryExpense = 0;
      let summarySavings = 0;

      // 1. Reuse existing trendData if it contains the selected month
      const trendForMonth = trendData.find(t => t.month === selectedMonth);
      if (trendForMonth) {
        summaryIncome = trendForMonth.income;
        summaryExpense = trendForMonth.expense;
        summarySavings = trendForMonth.savings;
      }

      // 2. Fetch specific month data for breakdowns
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const [incomeRes, expenseRes] = await Promise.all([
        fetch(`${BASE_URL}/income/filterByDate?startDate=${startDate}&endDate=${endDate}`, {
          headers: { authorization: `${token}` },
        }),
        fetch(`${BASE_URL}/expense/filterByDate?startDate=${startDate}&endDate=${endDate}`, {
          headers: { authorization: `${token}` },
        })
      ]);

      const incomeJson = await incomeRes.json();
      const expenseJson = await expenseRes.json();

      const incomes = incomeJson.success ? incomeJson.incomes : [];
      const expenses = expenseJson.success ? expenseJson.expenses : [];

      const incomeSourceMap = {};
      let calculatedTotalIncome = 0;
      incomes.forEach(inc => {
        calculatedTotalIncome += inc.amount;
        incomeSourceMap[inc.source] = (incomeSourceMap[inc.source] || 0) + inc.amount;
      });

      const expenseCategoryMap = {};
      let calculatedTotalExpense = 0;
      expenses.forEach(exp => {
        calculatedTotalExpense += exp.amount;
        expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
      });

      // If trendData wasn't available, fallback to the calculated totals
      if (!trendForMonth) {
        summaryIncome = calculatedTotalIncome;
        summaryExpense = calculatedTotalExpense;
        summarySavings = summaryIncome - summaryExpense;
      }

      // 3. Generate PDF
      const doc = new jsPDF();
      
      let userName = "User";
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const { name } = JSON.parse(storedUser);
          if (name) userName = name;
        } catch (e) {}
      }

      const formattedMonth = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

      // Title & Meta
      doc.setFontSize(22);
      doc.text("Monthly Financial Report", 14, 20);
      doc.setFontSize(12);
      doc.text(`Prepared for: ${userName}`, 14, 30);
      doc.text(`Selected Month: ${formattedMonth}`, 14, 38);

      // Summary Section
      doc.setFontSize(16);
      doc.text("Summary", 14, 50);
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Income', `Rs. ${summaryIncome}`],
          ['Total Expense', `Rs. ${summaryExpense}`],
          ['Net Savings', `Rs. ${summarySavings}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      let finalY = doc.lastAutoTable.finalY || 55;

      // Income Breakdown
      const incomeBody = Object.keys(incomeSourceMap).map(source => [source, `Rs. ${incomeSourceMap[source]}`]);
      if (incomeBody.length > 0) {
        doc.text("Income Source Breakdown", 14, finalY + 15);
        autoTable(doc, {
          startY: finalY + 20,
          head: [['Source', 'Amount']],
          body: incomeBody,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113] },
        });
        finalY = doc.lastAutoTable.finalY;
      }

      // Expense Breakdown
      const expenseBody = Object.keys(expenseCategoryMap).map(cat => [cat, `Rs. ${expenseCategoryMap[cat]}`]);
      if (expenseBody.length > 0) {
        if (finalY > 220) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY = finalY + 15;
        }
        doc.text("Expense Category Breakdown", 14, finalY);
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Category', 'Amount']],
          body: expenseBody,
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60] },
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        const footerText = `Generated by Expense Tracker | ${new Date().toLocaleDateString()}`;
        doc.text(footerText, 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`Financial_Report_${selectedMonth}.pdf`);
    } catch (err) {
      handleError("Failed to generate report");
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

      <div className="report-controls d-flex justify-content-center align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="monthSelect" className="fw-bold mb-0">Select Month:</label>
          <input 
            type="month" 
            id="monthSelect" 
            className="form-control w-auto" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
          />
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2" 
          onClick={handleDownloadReport}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Generating...
            </>
          ) : (
            <>📄 Download Monthly Report</>
          )}
        </button>
      </div>

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
