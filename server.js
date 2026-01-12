const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const skillRoutes = require("./routes/skillRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/activities", activityRoutes);
// Removed ML prediction route

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
