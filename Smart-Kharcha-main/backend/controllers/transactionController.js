const Transaction = require("../models/Transaction");

// get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// add new transaction
const addTransaction = async (req, res) => {
  try {
    console.log("Add Transaction Body:", req.body);
    const { title, amount, type, category, date } = req.body;
 
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || undefined
    });

    console.log("Created Transaction:", transaction);
    res.json(transaction);

  } catch (err) {
    console.error("Add Transaction Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// update transaction
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    console.log("Update Body:", req.body);

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    if (date) transaction.date = date;

    const updated = await transaction.save();
    console.log("Updated Transaction:", updated);
    res.json(updated);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// delete transaction
const deleteTransaction = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transaction.deleteOne();

    res.json({ message: "Transaction deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction
};