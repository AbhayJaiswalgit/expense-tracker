const mongoose = require("mongoose");
const user = require("./user");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
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
  },
  { timestamps: true }
);

const expense = mongoose.model("expense", expenseSchema);
module.exports = expense;
