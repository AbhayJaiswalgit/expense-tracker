const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // "income" or "expense" — determines which fields are active
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // Used when type === "expense" — same field name as expense.js
    category: {
      type: String,
      default: null,
    },
    // Used when type === "income" — same field name as income.js
    source: {
      type: String,
      default: null,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    // The date from which the schedule begins
    startDate: {
      type: Date,
      required: true,
    },
    // The next date the cron scheduler should create a transaction
    nextRunDate: {
      type: Date,
      required: true,
    },
    // true = active (will run), false = paused (skipped by cron)
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tracks when the last transaction was auto-generated
    lastRunDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const RecurringTransaction = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema
);

module.exports = RecurringTransaction;
