const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addActivity,
  getActivities
} = require("../controllers/activityController");

router.post("/", auth, addActivity);
router.get("/", auth, getActivities);

module.exports = router;
