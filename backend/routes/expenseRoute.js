const express = require("express");
const expenseValidation = require("../middlewares/expenseValidation");
const {
  handleAddExpense,
  handleDeleteExpense,
  handleExpensesByDate,
  handleCategorySummary,
  handleCurrMonthExpense,
} = require("../controllers/expenseControl");

const router = express.Router();

router.post("/add", expenseValidation, handleAddExpense);
router.delete("/:id", handleDeleteExpense);
router.get("/filterByDate", handleExpensesByDate);
router.get("/category", handleCategorySummary);
router.get("/monthexpense", handleCurrMonthExpense);

module.exports = router;
