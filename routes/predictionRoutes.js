const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  savePrediction,
  getPredictions,
} = require("../controllers/predictionController");
const { predictUsingML } = require("../controllers/predictionController");
router.post("/", auth, savePrediction);
router.get("/", auth, getPredictions);
router.post("/ml", auth, predictUsingML);

module.exports = router;
// Removed ML prediction route. File retained for reference.
