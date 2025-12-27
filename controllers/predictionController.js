const db = require("../config/db");

// Save career prediction
exports.savePrediction = (req, res) => {
  const { predicted_career, confidence_score } = req.body;

  db.query(
    `INSERT INTO career_predictions 
     (student_id, predicted_career, confidence_score, prediction_date)
     VALUES (?, ?, ?, CURDATE())`,
    [req.userId, predicted_career, confidence_score],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Prediction saved successfully" });
    }
  );
};
const { exec } = require("child_process");

exports.predictUsingML = (req, res) => {
  const { cgpa, dsa, java, ml, web } = req.body;

  const cmd = `python3 ml/predict.py ${cgpa} ${dsa} ${java} ${ml} ${web}`;

  exec(cmd, (err, stdout) => {
    if (err) return res.status(500).json(err);

    const [career, confidence] = stdout.trim().split(" ");

    res.json({
      predicted_career: career,
      confidence_score: confidence
    });
  });
};

// Get prediction history
exports.getPredictions = (req, res) => {
  db.query(
    "SELECT * FROM career_predictions WHERE student_id=? ORDER BY prediction_date DESC",
    [req.userId],
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    }
  );
};
