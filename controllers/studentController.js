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
  const { branch, year, section, tenth_percent, twelfth_percent, cgpa } = req.body;

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

                  // 5. Latest Prediction
                  db.query(
                    `SELECT predicted_career, confidence_score
                     FROM career_predictions
                     WHERE student_id=?
                     ORDER BY prediction_date DESC
                     LIMIT 1`,
                    [studentId],
                    (err, prediction) => {
                      if (err) return res.status(500).json(err);
                      dashboardData.prediction = prediction[0] || null;

                      res.json(dashboardData);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
exports.getRecommendations = (req, res) => {
  const studentId = req.userId;

  // Fetch skills + CGPA
  db.query(
    `SELECT s.skill_name, ss.level, st.cgpa
     FROM student_skills ss
     JOIN skills s ON ss.skill_id = s.skill_id
     JOIN students st ON st.student_id = ss.student_id
     WHERE ss.student_id = ?`,
    [studentId],
    (err, data) => {
      if (err) return res.status(500).json(err);

      let recommendations = [];
      let improvements = [];

      let skillMap = {};
      let cgpa = data[0]?.cgpa || 0;

      data.forEach(d => {
        skillMap[d.skill_name] = d.level;
      });

      // RULES
      if (skillMap["DSA"] >= 4 && skillMap["Java"] >= 4 && cgpa >= 8) {
        recommendations.push("Software Development Engineer");
      } else {
        if ((skillMap["DSA"] || 0) < 4) improvements.push("DSA");
        if ((skillMap["Java"] || 0) < 4) improvements.push("Java");
      }

      if (skillMap["Machine Learning"] >= 4 && cgpa >= 7.5) {
        recommendations.push("Data Scientist");
      }

      if (skillMap["Web Development"] >= 4) {
        recommendations.push("Full Stack Developer");
      }

      res.json({
        recommended_careers: recommendations,
        improvement_areas: improvements
      });
    }
  );
};