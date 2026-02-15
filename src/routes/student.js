const express = require("express");
const db = require("../db");
const upload = require("../middleware/upload");
const { requireRole } = require("../middleware/auth");
const { computeRecommendations } = require("../utils/reco");

const router = express.Router();
router.use(requireRole("student"));

router.get("/dashboard", async (req, res) => {
  const [profileRows] = await db.query("SELECT * FROM student_profiles WHERE user_id=?", [req.user.id]);
  const profile = profileRows[0];

  const [jobs] = await db.query(
    `SELECT j.id, j.title, j.location, j.type, j.tags, j.created_at, e.company_name
     FROM jobs j
     JOIN employer_profiles e ON e.user_id=j.employer_user_id
     WHERE j.status='open' AND e.is_verified=1`
  );
  const studentTags = (profile.skills || "").split(",").map(x => x.trim()).filter(Boolean);
  const recs = computeRecommendations(studentTags, jobs).slice(0, 8);

  const [apps] = await db.query(
    `SELECT a.id, a.status, a.created_at, j.title, e.company_name
     FROM applications a
     JOIN jobs j ON j.id=a.job_id
     JOIN employer_profiles e ON e.user_id=j.employer_user_id
     WHERE a.student_user_id=?
     ORDER BY a.created_at DESC
     LIMIT 10`,
    [req.user.id]
  );

  res.render("student/dashboard", { profile, recs, apps });
});

router.get("/profile", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM student_profiles WHERE user_id=?", [req.user.id]);
  res.render("student/profile", { profile: rows[0] });
});

router.put("/profile", async (req, res) => {
  const { full_name, university, major, skills } = req.body;
  await db.query(
    "UPDATE student_profiles SET full_name=?, university=?, major=?, skills=? WHERE user_id=?",
    [full_name, university, major, skills, req.user.id]
  );
  req.flash("success", "Profile updated.");
  res.redirect("/student/profile");
});

router.post("/profile/upload-cv", upload.single("cv_file"), async (req, res) => {
  await db.query(
    "UPDATE student_profiles SET cv_file_path=? WHERE user_id=?",
    ["/uploads/" + req.file.filename, req.user.id]
  );
  req.flash("success", "CV uploaded.");
  res.redirect("/student/profile");
});

router.post("/apply/:jobId", async (req, res) => {
  const jobId = req.params.jobId;
  const [existing] = await db.query(
    "SELECT id FROM applications WHERE student_user_id=? AND job_id=?",
    [req.user.id, jobId]
  );
  if (existing.length) {
    req.flash("error", "You already applied to this opportunity.");
    return res.redirect("/jobs/" + jobId);
  }
  await db.query(
    "INSERT INTO applications (job_id, student_user_id, status) VALUES (?, ?, 'submitted')",
    [jobId, req.user.id]
  );
  req.flash("success", "Application submitted.");
  res.redirect("/student/dashboard");
});

router.get("/applications", async (req, res) => {
  const [apps] = await db.query(
    `SELECT a.id, a.status, a.created_at, j.title, j.type, e.company_name
     FROM applications a
     JOIN jobs j ON j.id=a.job_id
     JOIN employer_profiles e ON e.user_id=j.employer_user_id
     WHERE a.student_user_id=?
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.render("student/applications", { apps });
});

module.exports = router;
