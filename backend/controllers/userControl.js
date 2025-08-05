const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const curruser = await user.findOne({ email });
    if (curruser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.create({ name, email, password: hashedPassword });
    return res
      .status(201)
      .json({ success: true, message: "account created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const curruser = await user.findOne({ email });
    if (!curruser) {
      return res
        .status(400)
        .json({ success: false, message: "create account" });
    }
    const verify = await bcrypt.compare(password, curruser.password);
    if (!verify) {
      return res
        .status(400)
        .json({ success: false, message: "incorrect password" });
    }
    const secret = process.env.SECRET;
    const jwttoken = jwt.sign({ _id: curruser._id }, secret, {
      expiresIn: "24h",
    });
    return res.status(200).json({
      success: true,
      message: "login successfully",
      jwttoken,
      email,
      name: curruser.name,
      id: curruser._id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

const handleMonthlyLimit = async (req, res) => {
  try {
    const { monthyLimit } = req.body;
    const curruser = await user.findByIdAndUpdate(
      req.user._id,
      { monthyLimit },
      { new: true }
    );

    return res
      .status(200)
      .json({
        success: true,
        monthyLimit: curruser.monthlyLimit,
        message: "Monthly Limit Updated",
      });
  } catch (err) {
    res.status(500).json({ error: "Failed to set limit" });
  }
};

module.exports = { handleLogin, handleSignUp, handleMonthlyLimit };
