const express = require("express");
const {
  signUpValidation,
  LoginValidation,
} = require("../middlewares/authValidation");
const ensureAuthentication = require("../middlewares/ensureAuthentication");

const {
  handleLogin,
  handleSignUp,
  handleMonthlyLimit,
} = require("../controllers/userControl");

const router = express.Router();

router.post("/signup", signUpValidation, handleSignUp);

router.post("/login", LoginValidation, handleLogin);

router.post("/set-monthly-limit", ensureAuthentication, handleMonthlyLimit);
module.exports = router;
