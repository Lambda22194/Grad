const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

router.get("/login", (req, res) => res.render("auth/login"));
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];
  if (!user) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/auth/login");
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    req.flash("error", "Invalid credentials.");
    return res.redirect("/auth/login");
  }
  req.session.userId = user.id;
  req.flash("success", "Logged in successfully.");
  if (user.role === "student") return res.redirect("/student/dashboard");
  if (user.role === "employer") return res.redirect("/employer/dashboard");
  if (user.role === "admin") return res.redirect("/admin/dashboard");
  res.redirect("/");
});

router.get("/register/student", (req, res) => res.render("auth/register_student"));
router.post("/register/student", async (req, res) => {
  const { full_name, email, password } = req.body;
  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    req.flash("error", "Email already exists.");
    return res.redirect("/auth/register/student");
  }
  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'student')",
    [email, hash]
  );
  await db.query("INSERT INTO student_profiles (user_id, full_name) VALUES (?, ?)", [r.insertId, full_name]);
  req.flash("success", "Student account created. Please login.");
  res.redirect("/auth/login");
});

router.get("/register/employer", (req, res) => res.render("auth/register_employer"));
router.post("/register/employer", async (req, res) => {
  const { company_name, contact_name, email, password, website } = req.body;
  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    req.flash("error", "Email already exists.");
    return res.redirect("/auth/register/employer");
  }
  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'employer')",
    [email, hash]
  );
  await db.query(
    "INSERT INTO employer_profiles (user_id, company_name, contact_name, website, is_verified) VALUES (?, ?, ?, ?, 0)",
    [r.insertId, company_name, contact_name, website || null]
  );
  req.flash("success", "Employer registered. Awaiting admin verification.");
  res.redirect("/auth/login");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
