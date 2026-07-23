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

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
