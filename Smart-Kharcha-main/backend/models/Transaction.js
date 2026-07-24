const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
    lowercase: true
  },

  category: {
    type: String,
    default: "general"
  },

  date: {
    type: Date,
    default: Date.now
  },

  description: {
    type: String,
    default: ""
  },

  paymentMethod: {
    type: String,
    default: "cash"
  },

  isPinned: {
    type: Boolean,
    default: false
  },

  tags: {
    type: [String],
    default: []
  },

  receiptImage: {
    type: String,
    default: null
  }
});

transactionSchema.pre("save", async function() {
  if (this.type) {
    this.type = this.type.toLowerCase();
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);