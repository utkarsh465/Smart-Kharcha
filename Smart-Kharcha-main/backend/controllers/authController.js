const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register user
const registerUser = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Login user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });

    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};