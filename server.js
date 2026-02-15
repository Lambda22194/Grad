require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const helmet = require("helmet");
const morgan = require("morgan");
const methodOverride = require("method-override");

const { attachUser } = require("./src/middleware/auth");
const authRoutes = require("./src/routes/auth");
const studentRoutes = require("./src/routes/student");
const employerRoutes = require("./src/routes/employer");
const adminRoutes = require("./src/routes/admin");
const publicRoutes = require("./src/routes/public");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "src", "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);
app.use(flash());
app.use(attachUser);

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error")
  };
  next();
});

app.use("/", publicRoutes);
app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use("/employer", employerRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => res.status(404).render("404"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
