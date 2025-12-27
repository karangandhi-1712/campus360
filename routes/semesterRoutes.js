const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { addSemester, getSemesters } = require("../controllers/semesterController");

router.post("/", auth, addSemester);
router.get("/", auth, getSemesters);

module.exports = router;
