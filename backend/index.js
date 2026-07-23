const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const expenseRoute = require("./routes/expenseRoute");
const incomeRoute = require("./routes/incomeRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const budgetRoute = require("./routes/budgetRoute");
const recurringRoute = require("./routes/recurringRoute");
const ensureAuthentication = require("./middlewares/ensureAuthentication");
const cors = require("cors");
const cron = require("node-cron");
const { processDueRecurring } = require("./controllers/recurringControl");

const app = express();
require("dotenv").config();

const port = process.env.PORT || 8080;
const my_url = process.env.MY_URL;

mongoose
  .connect(my_url)
  .then(() => {
    console.log(`DataBase connected`);
    // Start recurring transaction scheduler — runs every minute
    cron.schedule("* * * * *", processDueRecurring);
    console.log("[Cron] Recurring transaction scheduler started");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(cors());
app.use(express.json());
app.use("/auth", userRoute);
app.use("/income", ensureAuthentication, incomeRoute);
app.use("/expense", ensureAuthentication, expenseRoute);
app.use("/dashboard", ensureAuthentication, dashboardRoute);
app.use("/budget", ensureAuthentication, budgetRoute);
app.use("/recurring", ensureAuthentication, recurringRoute);

app.listen(port, () => {
  console.log(`Server started at PORT:${port}`);
});
