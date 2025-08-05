const express = require("express");
const {
  handleAddIncome,
  handleDeleteIncome,
  handleIncomesByDate,
  handleSourceSummary,
  handleCurrMonthIncome,
} = require("../controllers/incomeControl");

const router = express.Router();

router.post("/add", handleAddIncome);
router.delete("/:id", handleDeleteIncome);
router.get("/filterByDate", handleIncomesByDate);
router.get("/source", handleSourceSummary);
router.get("/monthincome", handleCurrMonthIncome);

module.exports = router;
