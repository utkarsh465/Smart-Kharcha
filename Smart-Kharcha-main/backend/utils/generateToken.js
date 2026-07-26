const jwt = require("jsonwebtoken");

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign(
    { id: id, tokenVersion: tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;