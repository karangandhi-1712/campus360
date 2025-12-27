const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/studentController");
const { getDashboard } = require("../controllers/studentController");
const { getRecommendations } = require("../controllers/studentController");

router.get("/recommendations", auth, getRecommendations);
router.get("/dashboard", auth, getDashboard);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
