const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction
} = require("../controllers/transactionController");


// get all transactions
router.get("/", protect, getTransactions);


// add new transaction
router.post("/", protect, addTransaction);


// delete transaction
router.delete("/:id", protect, deleteTransaction);

// update transaction
router.put("/:id", protect, updateTransaction);

module.exports = router;