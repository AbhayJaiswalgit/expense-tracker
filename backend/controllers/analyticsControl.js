const mongoose = require("mongoose");
const income = require("../models/income");
const expense = require("../models/expense");

const handleMonthlyTrends = async (req, res) => {
  const userId = req.user._id;

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const matchStage = {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: sixMonthsAgo }
      },
    };

    const incomeAggregation = await income.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    const expenseAggregation = await expense.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    // Pre-fill the last 6 months map
    const monthlyDataMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyDataMap[key] = {
        month: key,
        income: 0,
        expense: 0,
      };
    }

    // Merge actual data
    incomeAggregation.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].income = item.totalIncome;
      }
    });

    expenseAggregation.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].expense = item.totalExpense;
      }
    });

    const trends = Object.values(monthlyDataMap)
      .map(item => ({
        ...item,
        savings: item.income - item.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month)); // sort chronologically

    return res.status(200).json({
      success: true,
      trends,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { handleMonthlyTrends };
