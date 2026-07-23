const RecurringTransaction = require("../models/recurringTransaction");
const Expense = require("../models/expense");
const Income = require("../models/income");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: advance a date by the given frequency interval
// ─────────────────────────────────────────────────────────────────────────────
const calculateNextRunDate = (fromDate, frequency) => {
  const next = new Date(fromDate);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      break;
  }
  return next;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /recurring/create
// ─────────────────────────────────────────────────────────────────────────────
const handleCreate = async (req, res) => {
  try {
    const { type, title, amount, category, source, frequency, startDate } =
      req.body;
    const userId = req.user._id;

    // Basic validation
    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be 'income' or 'expense'",
      });
    }
    if (!title || !amount || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: "title, amount, frequency, and startDate are required",
      });
    }
    if (type === "expense" && !category) {
      return res.status(400).json({
        success: false,
        message: "category is required for expense type",
      });
    }
    if (type === "income" && !source) {
      return res.status(400).json({
        success: false,
        message: "source is required for income type",
      });
    }

    const start = new Date(startDate);

    const recurring = await RecurringTransaction.create({
      userId,
      type,
      title,
      amount: parseFloat(amount),
      category: type === "expense" ? category : null,
      source: type === "income" ? source : null,
      frequency,
      startDate: start,
      nextRunDate: start, // first execution is on startDate
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Recurring transaction created",
      data: recurring,
    });
  } catch (err) {
    console.error("Error creating recurring transaction:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /recurring/all
// ─────────────────────────────────────────────────────────────────────────────
const handleGetAll = async (req, res) => {
  try {
    const userId = req.user._id;
    const recurring = await RecurringTransaction.find({ userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: recurring });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /recurring/:id
// ─────────────────────────────────────────────────────────────────────────────
const handleUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, amount, category, source, frequency } = req.body;

    // Only update the field that matches the transaction type
    const recurring = await RecurringTransaction.findOne({ _id: id, userId });
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring transaction not found or unauthorized",
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (frequency !== undefined) updates.frequency = frequency;
    if (recurring.type === "expense" && category !== undefined)
      updates.category = category;
    if (recurring.type === "income" && source !== undefined)
      updates.source = source;

    const updated = await RecurringTransaction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Recurring transaction updated",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating recurring transaction:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /recurring/:id/toggle  — Pause / Resume
// ─────────────────────────────────────────────────────────────────────────────
const handleToggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring transaction not found or unauthorized",
      });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    return res.status(200).json({
      success: true,
      message: recurring.isActive ? "Resumed successfully" : "Paused successfully",
      data: recurring,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /recurring/:id
// ─────────────────────────────────────────────────────────────────────────────
const handleDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deleted = await RecurringTransaction.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Recurring transaction not found or unauthorized",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Scheduler — called by node-cron every minute from index.js
//
// Finds all active recurring transactions whose nextRunDate is in the past
// or present, creates the corresponding Expense or Income record, then
// advances nextRunDate by the frequency interval.
//
// Duplicate-safety: nextRunDate is advanced atomically after each run,
// so a second cron tick in the same minute will not see the same document
// as due again.
// ─────────────────────────────────────────────────────────────────────────────
const processDueRecurring = async () => {
  try {
    const now = new Date();

    const due = await RecurringTransaction.find({
      isActive: true,
      nextRunDate: { $lte: now },
    });

    if (due.length === 0) return;

    console.log(`[Cron] ${due.length} recurring transaction(s) due — processing...`);

    for (const rt of due) {
      try {
        // Reuse the existing Expense / Income model create — same call the
        // controllers use, just without the req/res wrapper.
        if (rt.type === "expense") {
          await Expense.create({
            title: rt.title,
            amount: rt.amount,
            category: rt.category, // same field name as expense.js
            userId: rt.userId,
            date: now,
            recurringId: rt._id,
          });
        } else {
          await Income.create({
            title: rt.title,
            amount: rt.amount,
            source: rt.source, // same field name as income.js
            userId: rt.userId,
            date: now,
            recurringId: rt._id,
          });
        }

        // Advance nextRunDate — update atomically to prevent duplicate runs
        const nextRun = calculateNextRunDate(now, rt.frequency);
        await RecurringTransaction.findByIdAndUpdate(rt._id, {
          $set: { nextRunDate: nextRun, lastRunDate: now },
        });

        console.log(
          `[Cron] ✔ Created ${rt.type} "${rt.title}" (₹${rt.amount}) → next run: ${nextRun.toISOString()}`
        );
      } catch (innerErr) {
        // Log per-transaction errors without stopping the whole batch
        console.error(
          `[Cron] ✖ Failed to process recurring ID ${rt._id}:`,
          innerErr.message
        );
      }
    }
  } catch (err) {
    console.error("[Cron] processDueRecurring error:", err.message);
  }
};

module.exports = {
  handleCreate,
  handleGetAll,
  handleUpdate,
  handleToggleStatus,
  handleDelete,
  processDueRecurring,
};
