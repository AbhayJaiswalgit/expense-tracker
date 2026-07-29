const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: String,
      default: null,
    },
    isOverall: {
      type: Boolean,
      default: false,
    },
    monthlyLimit: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate budgets for the same user/category/month/year combination.
// `sparse: true` is required because `category` is null for Overall budgets —
// without it, MongoDB would treat all null values as duplicates.
budgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true, sparse: true }
);

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
