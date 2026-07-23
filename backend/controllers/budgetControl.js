const Budget = require("../models/budget");
const Expense = require("../models/expense");

const handleSetBudget = async (req, res) => {
  try {
    const { category, isOverall, monthlyLimit, month, year } = req.body;
    const userId = req.user._id;

    const newBudget = await Budget.create({
      userId,
      category: isOverall ? null : category,
      isOverall: !!isOverall,
      monthlyLimit,
      month,
      year,
    });
    return res.status(201).json({
      success: true,
      message: "Budget set successfully",
      budget: newBudget,
    });
  } catch (err) {
    console.error("Error setting budget:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleGetBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await Budget.find({
      userId,
      month: currentMonth,
      year: currentYear,
    });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const query = {
          userId,
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        };
        if (!budget.isOverall) {
          query.category = budget.category;
        }

        const expenses = await Expense.find(query);

        const spent = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        );
        return { ...budget.toObject(), spent };
      }),
    );
    return res.status(200).json({ success: true, budgets: budgetsWithSpent });
  } catch (err) {
    console.error("Error fetching budgets:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleUpdateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthlyLimit } = req.body;
    const userId = req.user._id;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { monthlyLimit },
      { new: true },
    );

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Budget updated successfully", budget });
  } catch (err) {
    console.error("Error updating budget:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleDeleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOneAndDelete({ _id: id, userId });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleGetCategoryAverage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);

    const expenses = await Expense.find({
      userId,
      category,
      date: { $gte: threeMonthsAgo },
    });

    const monthlyTotals = {};
    expenses.forEach((expense) => {
      const expenseMonth = expense.date.getMonth();
      const expenseYear = expense.date.getFullYear();
      const key = `${expenseYear}-${expenseMonth}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + expense.amount;
    });

    const totalMonths = Object.keys(monthlyTotals).length;
    const totalAmount = Object.values(monthlyTotals).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    const average = totalMonths > 0 ? totalAmount / totalMonths : 0;

    return res.status(200).json({ success: true, average });
  } catch (err) {
    console.error("Error fetching category average:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleCheckBudgetExceed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, amount, date } = req.body;

    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    // Check category budget
    const catBudget = await Budget.findOne({
      userId,
      category,
      month,
      year,
    });

    // Check overall budget
    const overallBudget = await Budget.findOne({
      userId,
      isOverall: true,
      month,
      year,
    });

    const budgetsToCheck = [];
    if (catBudget) budgetsToCheck.push(catBudget);
    if (overallBudget) budgetsToCheck.push(overallBudget);

    let willExceed = false;
    let exceededBudget = null;

    for (const budget of budgetsToCheck) {
      const query = {
        userId,
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      };
      if (!budget.isOverall) {
        query.category = budget.category;
      }

      const expenses = await Expense.find(query);
      const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      if (spent + parseFloat(amount) > budget.monthlyLimit) {
        willExceed = true;
        exceededBudget = budget;
        break;
      }
    }

    if (!willExceed) {
      return res.status(200).json({ success: true, willExceed: false });
    }

    const query = {
      userId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    };
    if (!exceededBudget.isOverall) {
      query.category = exceededBudget.category;
    }
    const expenses = await Expense.find(query);
    const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return res.status(200).json({
      success: true,
      willExceed: true,
      monthlyLimit: exceededBudget.monthlyLimit,
      spent,
      category: exceededBudget.isOverall ? "Overall" : exceededBudget.category,
    });
  } catch (err) {
    console.error("Error checking budget exceed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  handleSetBudget,
  handleGetBudgets,
  handleGetCategoryAverage,
  handleCheckBudgetExceed,
  handleUpdateBudget,
  handleDeleteBudget,
};
