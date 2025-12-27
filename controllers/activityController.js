const db = require("../config/db");

// Add activity (project, internship, hackathon, etc.)
exports.addActivity = (req, res) => {
  const { type, title, description, date } = req.body;

  db.query(
    "INSERT INTO activities (student_id, type, title, description, date) VALUES (?, ?, ?, ?, ?)",
    [req.userId, type, title, description, date],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Activity added successfully" });
    }
  );
};

// Get all activities of student
exports.getActivities = (req, res) => {
  db.query(
    "SELECT * FROM activities WHERE student_id=? ORDER BY date DESC",
    [req.userId],
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    }
  );
};
