const express = require("express");
const {
  handleSetBudget,
  handleGetBudgets,
  handleGetCategoryAverage,
  handleCheckBudgetExceed,
  handleUpdateBudget,
  handleDeleteBudget,
} = require("../controllers/budgetControl");
const ensureAuthentication = require("../middlewares/ensureAuthentication");

const router = express.Router();

router.post("/set", handleSetBudget);
router.get("/current-month", handleGetBudgets);
router.get("/category-average", handleGetCategoryAverage);
router.post("/check-exceed", handleCheckBudgetExceed);
router.put("/update/:id", handleUpdateBudget);
router.delete("/delete/:id", handleDeleteBudget);

module.exports = router;
