const db = require("../config/db");

// Add a skill for student
exports.addSkill = (req, res) => {
  const { skill_id, level } = req.body;

  db.query(
    "INSERT INTO student_skills (student_id, skill_id, level) VALUES (?, ?, ?)",
    [req.userId, skill_id, level],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Skill added successfully" });
    }
  );
};

// Get all skills of student
exports.getSkills = (req, res) => {
  db.query(
    `SELECT s.skill_name, ss.level
     FROM student_skills ss
     JOIN skills s ON ss.skill_id = s.skill_id
     WHERE ss.student_id = ?`,
    [req.userId],
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    }
  );
};

// Update skill level
exports.updateSkill = (req, res) => {
  const { skill_id, level } = req.body;

  db.query(
    "UPDATE student_skills SET level=? WHERE student_id=? AND skill_id=?",
    [level, req.userId, skill_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Skill updated successfully" });
    }
  );
};
