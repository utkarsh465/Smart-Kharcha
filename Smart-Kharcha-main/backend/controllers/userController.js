const User = require("../models/User");
const Transaction = require("../models/Transaction");

// get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.preferences) {
      user.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
    }

    const updatedUser = await user.save();
    updatedUser.password = undefined; // don't return password hash

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logout all devices
const logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokenVersion += 1;
    await user.save();
    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete account
const deleteAccount = async (req, res) => {
  try {
    // delete user transactions first
    await Transaction.deleteMany({ user: req.user._id });
    
    // delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: "Account and all associated data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar, message: "Avatar updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  logoutAll,
  deleteAccount,
  uploadAvatar
};