const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireRole("admin"));

router.get("/dashboard", async (req, res) => {
  const [pending] = await db.query(
    `SELECT u.id AS user_id, u.email, e.company_name, e.contact_name, e.website, e.created_at
     FROM users u
     JOIN employer_profiles e ON e.user_id=u.id
     WHERE u.role='employer' AND e.is_verified=0
     ORDER BY e.created_at DESC`
  );

  const [stats] = await db.query(
    `SELECT
        (SELECT COUNT(*) FROM users WHERE role='student') AS students,
        (SELECT COUNT(*) FROM users WHERE role='employer') AS employers,
        (SELECT COUNT(*) FROM jobs) AS jobs,
        (SELECT COUNT(*) FROM applications) AS applications`
  );

  res.render("admin/dashboard", { pending, stats: stats[0] });
});

router.put("/employers/:userId/verify", async (req, res) => {
  await db.query("UPDATE employer_profiles SET is_verified=1 WHERE user_id=?", [req.params.userId]);
  req.flash("success", "Employer verified.");
  res.redirect("/admin/dashboard");
});

router.put("/employers/:userId/reject", async (req, res) => {
  await db.query("DELETE FROM employer_profiles WHERE user_id=?", [req.params.userId]);
  await db.query("DELETE FROM users WHERE id=?", [req.params.userId]);
  req.flash("success", "Employer rejected and removed.");
  res.redirect("/admin/dashboard");
});

module.exports = router;
