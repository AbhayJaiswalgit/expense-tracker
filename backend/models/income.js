const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // Set by the cron scheduler when auto-generating from a recurring template
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecurringTransaction",
    default: null,
  },
});

const income = mongoose.model("income", incomeSchema);
module.exports = income;
