const express = require("express");
const { handleMonthlyTrends } = require("../controllers/analyticsControl");

const router = express.Router();

router.get("/monthly-trends", handleMonthlyTrends);

module.exports = router;
