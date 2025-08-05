const { default: mongoose } = require("mongoose");
const expense = require("../models/expense");

const handleAddExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.user._id;
    await expense.create({ title, amount, category, userId, date });
    return res.status(201).json({ message: "expense added", success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", success: false });
  }
};

const handleDeleteExpense = async (req, res) => {
  try {
    const deleted = await expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", success: false });
  }
};

const handleExpensesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    const expenses = await expense.find({
      userId: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });
    let total = 0;
    for (let i = 0; i < expenses.length; i++) {
      total += expenses[i].amount;
    }
    return res.status(200).json({ expenses, total, success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", success: false });
  }
};

const handleCategorySummary = async (req, res) => {
  const userId = req.user._id;
  try {
    const summary = await expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
    ]);
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleCurrMonthExpense = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const expenses = await expense.find({
      userId: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    let total = 0;
    for (let i = 0; i < expenses.length; i++) {
      total += expenses[i].amount;
    }

    return res
      .status(200)
      .json({ success: true, total, count: expenses.length });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  handleAddExpense,
  handleDeleteExpense,
  handleExpensesByDate,
  handleCategorySummary,
  handleCurrMonthExpense,
};
