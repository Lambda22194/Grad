const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [jobs] = await db.query(
    `SELECT j.id, j.title, j.location, j.type, j.created_at, e.company_name
     FROM jobs j
     JOIN employer_profiles e ON e.user_id = j.employer_user_id
     WHERE j.status='open' AND e.is_verified=1
     ORDER BY j.created_at DESC
     LIMIT 10`
  );
  res.render("public/home", { jobs });
});

router.get("/jobs", async (req, res) => {
  const q = (req.query.q || "").trim();
  const type = (req.query.type || "").trim();
  const location = (req.query.location || "").trim();

  const params = [];
  let where = "WHERE j.status='open' AND e.is_verified=1";
  if (q) { where += " AND (j.title LIKE ? OR j.description LIKE ? OR j.tags LIKE ?)"; params.push(`%${q}%`,`%${q}%`,`%${q}%`); }
  if (type) { where += " AND j.type = ?"; params.push(type); }
  if (location) { where += " AND j.location LIKE ?"; params.push(`%${location}%`); }

  const [jobs] = await db.query(
    `SELECT j.*, e.company_name
     FROM jobs j
     JOIN employer_profiles e ON e.user_id = j.employer_user_id
     ${where}
     ORDER BY j.created_at DESC`,
    params
  );
  res.render("public/jobs", { jobs, filters: { q, type, location } });
});

router.get("/jobs/:id", async (req, res) => {
  const [rows] = await db.query(
    `SELECT j.*, e.company_name, e.website
     FROM jobs j
     JOIN employer_profiles e ON e.user_id = j.employer_user_id
     WHERE j.id=?`,
    [req.params.id]
  );
  const job = rows[0];
  if (!job) return res.status(404).render("404");
  res.render("public/job_detail", { job });
});

module.exports = router;
