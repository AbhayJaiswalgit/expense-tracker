const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    monthlyLimit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const user = mongoose.model("user", UserSchema);
module.exports = user;
