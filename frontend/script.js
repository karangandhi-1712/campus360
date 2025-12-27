const API = "http://localhost:5000";
// LOGIN FUNCTION (unchanged)
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(API + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    }
  });
}
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const branch = document.getElementById("branch").value;
  const year = document.getElementById("year").value;

  // PASSWORD VALIDATION REGEX
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!passwordRegex.test(password)) {
    document.getElementById("msg").innerText =
      "Password must be at least 8 characters with uppercase, lowercase and number.";
    return;
  }

  fetch(API + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, branch, year })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText =
      data.message || data.error;
  });
}

// DASHBOARD
if (window.location.pathname.includes("dashboard")) {
  fetch(API + "/api/students/dashboard", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
    
  })

  .then(res => res.json())
  .then(data => {
      let completed = 0;

if (data.profile.cgpa) completed++;
if (data.skills.length > 0) completed++;
if (data.semesters.length > 0) completed++;
if (data.activities.length > 0) completed++;

let percent = (completed / 4) * 100;

document.getElementById("progressBar").style.width = percent + "%";
document.getElementById("progressText").innerText =
  "Profile completion: " + percent + "%";

    // PROFILE
    document.getElementById("profile").innerHTML = `
      <h3>Profile</h3>
      <b>Name:</b> ${data.profile.name}<br>
      <b>Branch:</b> ${data.profile.branch}<br>
      <b>CGPA:</b> ${data.profile.cgpa}
    `;
    // PREDICTION
    if (data.prediction) {
      document.getElementById("prediction").innerHTML = `
        <h3>Career Prediction</h3>
        <b>${data.prediction.predicted_career}</b><br>
        Confidence: ${data.prediction.confidence_score}%
      `;
    } else {
      document.getElementById("prediction").innerHTML =
        "<h3>Career Prediction</h3>No prediction available";
    }
    // RECOMMENDATIONS
fetch(API + "/api/students/recommendations", {
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(rec => {
  let html = "<h3>Recommendations</h3>";

  if (rec.recommended_careers.length > 0) {
    html += "<b>Careers:</b><br>";
    rec.recommended_careers.forEach(c => {
      html += "• " + c + "<br>";
    });
  }

  if (rec.improvement_areas.length > 0) {
    html += "<br><b>Improve:</b><br>";
    rec.improvement_areas.forEach(i => {
      html += "• " + i + "<br>";
    });
  }

  document.getElementById("recommendations").innerHTML = html;
});
    // SKILLS
    let skillsHTML = "<h3>Skills</h3>";
    data.skills.forEach(s => {
      skillsHTML += `${s.skill_name} — Level ${s.level}<br>`;
    });
    document.getElementById("skills").innerHTML = skillsHTML;
    // ACTIVITIES
    let actHTML = "<h3>Activities</h3>";
    data.activities.forEach(a => {
      actHTML += `${a.type}: ${a.title} (${a.date})<br>`;
    });
    document.getElementById("activities").innerHTML = actHTML;
    // SGPA CHART
    const labels = data.semesters.map(s => "Sem " + s.semester_no);
    const sgpaData = data.semesters.map(s => s.sgpa);
    new Chart(document.getElementById("sgpaChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "SGPA",
          data: sgpaData,
          borderColor: "#3498db",
          fill: false
        }]
      }
    });
  });
}
function updateProfile() {
  fetch(API + "/api/students/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      section: document.getElementById("section").value,
      tenth_percent: document.getElementById("tenth").value,
      twelth_percent: document.getElementById("twelth").value,
      cgpa: document.getElementById("cgpa").value
    })
  })
  .then(res => res.json())
  .then(() => alert("Profile updated"));
}
function addSkill() {
  fetch(API + "/api/skills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      skill_id: document.getElementById("skill_id").value,
      level: document.getElementById("skill_level").value
    })
  })
  .then(res => res.json())
  .then(() => alert("Skill added"));
}
function addSemester() {
  fetch(API + "/api/semesters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      semester_no: document.getElementById("sem_no").value,
      sgpa: document.getElementById("sgpa").value
    })
  })
  .then(res => res.json())
  .then(() => alert("Semester added"));
}
function addActivity() {
  fetch(API + "/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      type: document.getElementById("act_type").value,
      title: document.getElementById("act_title").value,
      date: document.getElementById("act_date").value
    })
  })
  .then(res => res.json())
  .then(() => alert("Activity added"));
}
