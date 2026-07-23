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

router.post("/set", ensureAuthentication, handleSetBudget);
router.get("/current-month", ensureAuthentication, handleGetBudgets);
router.get("/category-average", ensureAuthentication, handleGetCategoryAverage);
router.post("/check-exceed", ensureAuthentication, handleCheckBudgetExceed);
router.put("/update/:id", ensureAuthentication, handleUpdateBudget);
router.delete("/delete/:id", ensureAuthentication, handleDeleteBudget);

module.exports = router;
