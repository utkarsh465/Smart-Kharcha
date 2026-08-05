const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

  let token;

  try {

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
         return res.status(401).json({ message: "Session expired (logged out from all devices)" });
      }
      
      req.user = user;
      next();

    } else {

      res.status(401).json({ message: "Not authorized, no token" });

    }

  } catch (err) {

    res.status(401).json({ message: "Token failed" });

  }

};

module.exports = { protect };