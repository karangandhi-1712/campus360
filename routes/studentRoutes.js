const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getDashboard,
} = require("../controllers/studentController");

// Removed recommendations route
router.get("/dashboard", auth, getDashboard);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
