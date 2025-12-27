const db = require("../config/db");

exports.addSemester = (req, res) => {
  const { semester_no, sgpa } = req.body;

  db.query(
    "INSERT INTO semesters (student_id, semester_no, sgpa) VALUES (?, ?, ?)",
    [req.userId, semester_no, sgpa],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Semester added successfully" });
    }
  );
};

exports.getSemesters = (req, res) => {
  db.query(
    "SELECT * FROM semesters WHERE student_id=?",
    [req.userId],
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    }
  );
};
