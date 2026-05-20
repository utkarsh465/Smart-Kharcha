const User = require("../models/User");

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

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

module.exports = {
  getProfile,
  updateProfile
};