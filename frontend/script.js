const API = "http://localhost:5000";

// Toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// LOGIN FUNCTION (unchanged)
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch(API + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
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
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    document.getElementById("msg").innerText =
      "Password must be at least 8 characters with uppercase, lowercase and number.";
    return;
  }
  fetch(API + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, branch, year }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("msg").innerText = data.message || data.error;
    });
}

// DASHBOARD
if (window.location.pathname.includes("dashboard")) {
  function fetchAndRenderDashboard() {
    fetch(API + "/api/students/dashboard", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // DEMO: Fill with random data if empty
        if (!data.skills || data.skills.length === 0) {
          data.skills = [
            { skill_name: "Java", level: Math.ceil(Math.random() * 5) },
            {
              skill_name: "Web Development",
              level: Math.ceil(Math.random() * 5),
            },
            { skill_name: "DSA", level: Math.ceil(Math.random() * 5) },
          ];
        }
        if (!data.activities || data.activities.length === 0) {
          data.activities = [
            { type: "Project", title: "Campus App", date: "2025-11-01" },
            { type: "Internship", title: "Tech Corp", date: "2025-07-15" },
          ];
        }
        if (!data.semesters || data.semesters.length === 0) {
          data.semesters = [
            { semester_no: 1, sgpa: (6 + Math.random() * 2).toFixed(2) },
            { semester_no: 2, sgpa: (6.5 + Math.random() * 2).toFixed(2) },
            { semester_no: 3, sgpa: (7 + Math.random() * 2).toFixed(2) },
            { semester_no: 4, sgpa: (7.5 + Math.random() * 2).toFixed(2) },
          ];
        }
        if (!data.profile) {
          data.profile = { name: "Demo User", branch: "CSE", cgpa: "8.2" };
        }

        let completed = 0;
        if (data.profile.cgpa) completed++;
        if (data.skills.length > 0) completed++;
        if (data.semesters.length > 0) completed++;
        if (data.activities.length > 0) completed++;
        let percent = (completed / 4) * 100;
        animateProgressBar(percent);
        document.getElementById("progressText").innerText =
          "Profile completion: " + percent + "%";

        // PROFILE
        document.getElementById("profile").innerHTML = `
          <h3>Profile</h3>
          <b>Name:</b> ${data.profile.name}<br>
          <b>Branch:</b> ${data.profile.branch}<br>
          <b>CGPA:</b> ${data.profile.cgpa ?? "-"}
        `;

        // SKILLS
        let skillsHTML = "<h3>Skills</h3>";
        if (data.skills.length === 0) {
          skillsHTML += '<span style="color:#aaa">No skills added yet.</span>';
        }
        data.skills.forEach((s) => {
          skillsHTML += `<div class="skill-item"><span>${s.skill_name}</span> <span class="skill-level">Level ${s.level}</span></div>`;
        });
        document.getElementById("skills").innerHTML = skillsHTML;

        // ACTIVITIES
        let actHTML = "<h3>Activities</h3>";
        if (data.activities.length === 0) {
          actHTML += '<span style="color:#aaa">No activities yet.</span>';
        }
        data.activities.forEach((a) => {
          actHTML += `<div class="activity-item"><b>${a.type}:</b> ${a.title} <span class="activity-date">(${a.date})</span></div>`;
        });
        document.getElementById("activities").innerHTML = actHTML;

        // SGPA CHART & CGPA
        const labels = data.semesters.map((s) => "Sem " + s.semester_no);
        const sgpaData = data.semesters.map((s) => parseFloat(s.sgpa));
        let cgpa = sgpaData.length
          ? (sgpaData.reduce((a, b) => a + b, 0) / sgpaData.length).toFixed(2)
          : "-";
        renderSGPAChart(labels, sgpaData, cgpa);
      });
  }
  fetchAndRenderDashboard();

  // Patch: update dashboard after adding skill/semester
  window.addSkill = function () {
    fetch(API + "/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        skill_id: document.getElementById("skill_id").value,
        level: document.getElementById("skill_level").value,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Skill added!");
        fetchAndRenderDashboard();
      });
  };
  window.addSemester = function () {
    fetch(API + "/api/semesters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        semester_no: document.getElementById("sem_no").value,
        sgpa: document.getElementById("sgpa").value,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Semester added!");
        fetchAndRenderDashboard();
      });
  };
  window.addActivity = function () {
    fetch(API + "/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        type: document.getElementById("act_type").value,
        title: document.getElementById("act_title").value,
        date: document.getElementById("act_date").value,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Activity added!");
        fetchAndRenderDashboard();
      });
  };
  window.updateProfile = function () {
    fetch(API + "/api/students/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        section: document.getElementById("section").value,
        tenth_percent: document.getElementById("tenth").value,
        twelth_percent: document.getElementById("twelth").value,
        cgpa: document.getElementById("cgpa").value,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Profile updated!");
        fetchAndRenderDashboard();
      });
  };
}

function animateProgressBar(percent) {
  const bar = document.getElementById("progressBar");
  bar.style.width = "0%";
  setTimeout(() => {
    bar.style.width = percent + "%";
  }, 200);
}

let sgpaChartInstance = null;
function renderSGPAChart(labels, data, cgpa) {
  // Update CGPA label in the SGPA card
  const cgpaLabel = document.getElementById("cgpa-label");
  if (cgpaLabel) {
    cgpaLabel.textContent = `CGPA: ${cgpa}`;
  }
  const ctx = document.getElementById("sgpaChart").getContext("2d");
  if (sgpaChartInstance) sgpaChartInstance.destroy();
  sgpaChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "SGPA",
          data: data,
          borderColor: "#3498db",
          backgroundColor: "#6dd5ed33",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: false,
        },
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 10,
        },
      },
    },
  });
}

function updateProfile() {
  fetch(API + "/api/students/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      section: document.getElementById("section").value,
      tenth_percent: document.getElementById("tenth").value,
      twelth_percent: document.getElementById("twelth").value,
      cgpa: document.getElementById("cgpa").value,
    }),
  })
    .then((res) => res.json())
    .then(() => showToast("Profile updated!"));
}

function addSkill() {
  fetch(API + "/api/skills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      skill_id: document.getElementById("skill_id").value,
      level: document.getElementById("skill_level").value,
    }),
  })
    .then((res) => res.json())
    .then(() => showToast("Skill added!"));
}

function addSemester() {
  fetch(API + "/api/semesters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      semester_no: document.getElementById("sem_no").value,
      sgpa: document.getElementById("sgpa").value,
    }),
  })
    .then((res) => res.json())
    .then(() => showToast("Semester added!"));
}

function addActivity() {
  fetch(API + "/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      type: document.getElementById("act_type").value,
      title: document.getElementById("act_title").value,
      date: document.getElementById("act_date").value,
    }),
  })
    .then((res) => res.json())
    .then(() => showToast("Activity added!"));
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
