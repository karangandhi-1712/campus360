const db = require("../config/db");

exports.getProfile = (req, res) => {
  db.query(
    "SELECT * FROM students WHERE student_id=?",
    [req.userId],
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data[0]);
    }
  );
};

exports.updateProfile = (req, res) => {
  const { branch, year, section, tenth_percent, twelfth_percent, cgpa } =
    req.body;

  db.query(
    `UPDATE students SET branch=?, year=?, section=?,
     tenth_percent=?, twelfth_percent=?, cgpa=?
     WHERE student_id=?`,
    [branch, year, section, tenth_percent, twelfth_percent, cgpa, req.userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Profile updated successfully" });
    }
  );
};
exports.getDashboard = (req, res) => {
  const studentId = req.userId;

  const dashboardData = {};

  // 1. Profile
  db.query(
    "SELECT student_id, name, email, branch, year, cgpa FROM students WHERE student_id=?",
    [studentId],
    (err, profile) => {
      if (err) return res.status(500).json(err);
      dashboardData.profile = profile[0];

      // 2. Semesters
      db.query(
        "SELECT semester_no, sgpa FROM semesters WHERE student_id=? ORDER BY semester_no",
        [studentId],
        (err, semesters) => {
          if (err) return res.status(500).json(err);
          dashboardData.semesters = semesters;

          // 3. Skills
          db.query(
            `SELECT s.skill_name, ss.level
             FROM student_skills ss
             JOIN skills s ON ss.skill_id = s.skill_id
             WHERE ss.student_id=?`,
            [studentId],
            (err, skills) => {
              if (err) return res.status(500).json(err);
              dashboardData.skills = skills;

              // 4. Activities
              db.query(
                "SELECT type, title, date FROM activities WHERE student_id=? ORDER BY date DESC",
                [studentId],
                (err, activities) => {
                  if (err) return res.status(500).json(err);
                  dashboardData.activities = activities;

                  // Removed ML prediction integration. Return dashboard data directly.
                  res.json(dashboardData);
                }
              );
            }
          );
        }
      );
    }
  );
};
// Removed getRecommendations as ML is no longer part of the project.
