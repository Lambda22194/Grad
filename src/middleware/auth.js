const db = require("../db");

async function attachUser(req, res, next) {
  if (!req.session.userId) return next();
  const [rows] = await db.query(
    "SELECT id, email, role, created_at FROM users WHERE id = ?",
    [req.session.userId]
  );
  req.user = rows[0] || null;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      req.flash("error", "Please login first.");
      return res.redirect("/auth/login");
    }
    if (req.user.role !== role) {
      req.flash("error", "Access denied.");
      return res.redirect("/");
    }
    next();
  };
}

module.exports = { attachUser, requireRole };
