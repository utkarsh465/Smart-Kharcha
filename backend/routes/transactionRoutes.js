const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getCalendarTransactions,
  getDashboardMetrics,
  getTransactionAnalytics,
  duplicateTransaction,
  pinTransaction
} = require("../controllers/transactionController");


// get dashboard metrics
router.get("/dashboard-metrics", protect, getDashboardMetrics);

// get calendar transactions
router.get("/calendar", protect, getCalendarTransactions);

// get advanced analytics for transactions
router.get("/analytics", protect, getTransactionAnalytics);

// get all transactions (now with pagination/filtering)
router.get("/", protect, getTransactions);


// add new transaction
router.post("/", protect, addTransaction);


// delete transaction
router.delete("/:id", protect, deleteTransaction);

// update transaction
router.put("/:id", protect, updateTransaction);

// duplicate transaction
router.post("/:id/duplicate", protect, duplicateTransaction);

// pin/unpin transaction
router.put("/:id/pin", protect, pinTransaction);

module.exports = router;