const express = require("express");
const {
  handleGetSummary,
  handleGetAllTransaction,
} = require("../controllers/dashboardControl");

const router = express.Router();

router.get("/summary", handleGetSummary);
router.get("/allTransactions", handleGetAllTransaction);

module.exports = router;
