const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireRole("employer"));

async function getEmployerProfile(userId) {
  const [rows] = await db.query("SELECT * FROM employer_profiles WHERE user_id=?", [userId]);
  return rows[0];
}

router.get("/dashboard", async (req, res) => {
  const profile = await getEmployerProfile(req.user.id);
  const [jobs] = await db.query("SELECT * FROM jobs WHERE employer_user_id=? ORDER BY created_at DESC", [req.user.id]);
  res.render("employer/dashboard", { profile, jobs });
});

router.get("/profile", async (req, res) => {
  const profile = await getEmployerProfile(req.user.id);
  res.render("employer/profile", { profile });
});

router.put("/profile", async (req, res) => {
  const { company_name, contact_name, website, description } = req.body;
  await db.query(
    "UPDATE employer_profiles SET company_name=?, contact_name=?, website=?, description=? WHERE user_id=?",
    [company_name, contact_name, website, description, req.user.id]
  );
  req.flash("success", "Company profile updated.");
  res.redirect("/employer/profile");
});

router.get("/jobs/new", async (req, res) => {
  const profile = await getEmployerProfile(req.user.id);
  if (!profile.is_verified) {
    req.flash("error", "Your account is not verified yet. You cannot post jobs.");
    return res.redirect("/employer/dashboard");
  }
  res.render("employer/job_new");
});

router.post("/jobs", async (req, res) => {
  const profile = await getEmployerProfile(req.user.id);
  if (!profile.is_verified) {
    req.flash("error", "Your account is not verified yet. You cannot post jobs.");
    return res.redirect("/employer/dashboard");
  }
  const { title, type, location, tags, description } = req.body;
  await db.query(
    `INSERT INTO jobs (employer_user_id, title, type, location, tags, description, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [req.user.id, title, type, location, tags, description]
  );
  req.flash("success", "Job posted.");
  res.redirect("/employer/dashboard");
});

router.get("/jobs/:id/applications", async (req, res) => {
  const jobId = req.params.id;
  const [jobRows] = await db.query("SELECT * FROM jobs WHERE id=? AND employer_user_id=?", [jobId, req.user.id]);
  const job = jobRows[0];
  if (!job) return res.status(404).render("404");

  const [apps] = await db.query(
    `SELECT a.id, a.status, a.created_at, s.full_name, s.university, s.major, s.skills, s.cv_file_path
     FROM applications a
     JOIN student_profiles s ON s.user_id=a.student_user_id
     WHERE a.job_id=?
     ORDER BY a.created_at DESC`,
    [jobId]
  );
  res.render("employer/applications", { job, apps });
});

router.put("/applications/:appId/status", async (req, res) => {
  const { status } = req.body; // shortlisted | rejected | accepted
  const appId = req.params.appId;

  const [rows] = await db.query(
    `SELECT a.id, a.status AS current_status, a.job_id
     FROM applications a
     JOIN jobs j ON j.id=a.job_id
     WHERE a.id=? AND j.employer_user_id=?`,
    [appId, req.user.id]
  );
  const rec = rows[0];
  if (!rec) {
    req.flash("error", "Application not found.");
    return res.redirect("/employer/dashboard");
  }

  const allowed = new Set(["shortlisted", "rejected", "accepted"]);
  if (!allowed.has(status)) {
    req.flash("error", "Invalid status.");
    return res.redirect(`/employer/jobs/${rec.job_id}/applications`);
  }

  const cs = rec.current_status;
  const ok =
    (cs === "submitted" && (status === "shortlisted" || status === "rejected")) ||
    (cs === "shortlisted" && (status === "accepted" || status === "rejected"));

  if (!ok) {
    req.flash("error", "Invalid status transition.");
    return res.redirect(`/employer/jobs/${rec.job_id}/applications`);
  }

  await db.query("UPDATE applications SET status=? WHERE id=?", [status, appId]);
  req.flash("success", `Application updated to '${status}'.`);
  res.redirect(`/employer/jobs/${rec.job_id}/applications`);
});

module.exports = router;
