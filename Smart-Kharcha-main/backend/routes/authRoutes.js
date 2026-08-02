const express = require("express");
const router = express.Router();

const { registerUser, loginUser, checkEmail } = require("../controllers/authController");

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);

// check email
router.post("/check-email", checkEmail);

module.exports = router;