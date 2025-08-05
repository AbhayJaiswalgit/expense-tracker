const income = require("../models/income");

const handleAddIncome = async (req, res) => {
  try {
    const { title, amount, source, date } = req.body;
    const userId = req.user._id;
    await income.create({ title, amount, source, userId, date });
    return res.status(201).json({ message: "income added", success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", success: false });
  }
};

const handleDeleteIncome = async (req, res) => {
  try {
    const deleted = await income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Income not found or unauthorized",
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

const handleIncomesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Add 1 day to include the entire end day
    end.setDate(end.getDate() + 1);

    const incomes = await income.find({
      userId: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    console.log(incomes);

    let total = 0;
    for (let i = 0; i < incomes.length; i++) {
      total += incomes[i].amount;
    }

    return res.status(200).json({ incomes, total, success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", success: false });
  }
};

const handleSourceSummary = async (req, res) => {
  const userId = req.user._id;
  try {
    const summary = await income.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
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

const handleCurrMonthIncome = async (req, res) => {
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

    const incomes = await income.find({
      userId: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    let total = 0;
    for (let i = 0; i < incomes.length; i++) {
      total += incomes[i].amount;
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return res.status(200).json({
      success: true,
      total,
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      count: incomes.length,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  handleAddIncome,
  handleDeleteIncome,
  handleIncomesByDate,
  handleSourceSummary,
  handleCurrMonthIncome,
};
