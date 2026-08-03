const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register user
const registerUser = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    let { name, email, password } = req.body;
    
    if (email) {
      email = email.toLowerCase().trim();
    }

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
        token: generateToken(user._id, user.tokenVersion)
      });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Login user
const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    
    if (email) {
      email = email.toLowerCase().trim();
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = Date.now();
      await user.save();
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check email availability
const checkEmail = async (req, res, next) => {
  try {
    let { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    email = email.toLowerCase().trim();
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.json({ available: false, message: "Email already exists" });
    }
    
    return res.json({ available: true, message: "Email available" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkEmail
};