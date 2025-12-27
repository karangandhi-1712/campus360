const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addSkill,
  getSkills,
  updateSkill
} = require("../controllers/skillController");

router.post("/", auth, addSkill);
router.get("/", auth, getSkills);
router.put("/", auth, updateSkill);

module.exports = router;
