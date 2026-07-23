const express = require("express");
const {
  handleCreate,
  handleGetAll,
  handleUpdate,
  handleToggleStatus,
  handleDelete,
} = require("../controllers/recurringControl");

const router = express.Router();

// All routes already protected by ensureAuthentication applied in index.js
router.post("/create", handleCreate);
router.get("/all", handleGetAll);
router.put("/:id", handleUpdate);
router.patch("/:id/toggle", handleToggleStatus);
router.delete("/:id", handleDelete);

module.exports = router;
