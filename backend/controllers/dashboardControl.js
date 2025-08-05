const income = require("../models/income");
const expense = require("../models/expense");
const mongoose = require("mongoose");
const { date } = require("joi");

const handleGetSummary = async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;
  try {
    const [incomeTotal] = await income.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [expenseTotal] = await expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentIncome = await income
      .find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const recentExpense = await expense
      .find({ userId })
      .sort({ date: -1 })
      .limit(5);

    console.log("   recentIncome count:", recentIncome.length);
    console.log("   recentExpense count:", recentExpense.length);

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome:
          incomeTotal?.total ||
          incomeTotal?.["total"] ||
          incomeTotal?.["0"]?.total ||
          0,
        totalExpense:
          expenseTotal?.total ||
          expenseTotal?.["total"] ||
          expenseTotal?.["0"]?.total ||
          0,
        netBalance:
          (incomeTotal?.total || incomeTotal?.["0"]?.total || 0) -
          (expenseTotal?.total || expenseTotal?.["0"]?.total || 0),
      },
      recent: {
        income: recentIncome,
        expenses: recentExpense,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleGetAllTransaction = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomes = await income.find({ userId });
    const incomeWithType = incomes.map((item) => ({
      ...item.toObject(),
      type: "income",
    }));

    const expenses = await expense.find({ userId });

    const expenseWithType = expenses.map((item) => ({
      ...item.toObject(),
      type: "expense",
    }));

    const allTransactions = [...expenseWithType, ...incomeWithType].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json({ success: true, data: allTransactions });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { handleGetSummary, handleGetAllTransaction };
