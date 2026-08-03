const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: ''
  },

  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  phone: {
    type: String,
    default: ''
  },

  dob: {
    type: Date
  },

  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
    default: ''
  },

  occupation: {
    type: String,
    default: ''
  },

  country: {
    type: String,
    default: ''
  },

  city: {
    type: String,
    default: ''
  },

  accountStatus: {
    type: String,
    enum: ['Active', 'Suspended', 'Inactive'],
    default: 'Active'
  },

  lastLogin: {
    type: Date
  },

  preferences: {
    currency: { type: String, default: '₹' },
    budgetLimit: { type: Number, default: 10000 },
    appLanguage: { type: String, default: 'en' },
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  },

  loginHistory: [{
    ip: String,
    browser: String,
    os: String,
    device: String,
    time: { type: Date, default: Date.now }
  }],

  tokenVersion: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);