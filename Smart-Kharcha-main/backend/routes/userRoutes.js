const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  logoutAll,
  deleteAccount,
  uploadAvatar
} = require("../controllers/userController");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.delete("/profile", protect, deleteAccount);

router.post("/logout-all", protect, logoutAll);

router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;