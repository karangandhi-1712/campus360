const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
  const { name, email, password, branch, year } = req.body;
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: "Weak password. Use uppercase, lowercase, number, min 8 chars."
    });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO students (name, email, password_hash, branch, year) VALUES (?, ?, ?, ?, ?)",
    [name, email, hashedPassword, branch, year],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Student registered successfully" });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM students WHERE email=?",
    [email],
    (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0)
        return res.status(404).json({ error: "User not found" });

      const student = data[0];
      const isMatch = bcrypt.compareSync(password, student.password_hash);

      if (!isMatch)
        return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign(
        { id: student.student_id },
        "secretkey",
        { expiresIn: "1d" }
      );

      res.json({ message: "Login successful", token });
    }
  );
};
