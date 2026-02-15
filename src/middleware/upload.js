const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const ok = [".pdf", ".doc", ".docx"].includes(path.extname(file.originalname).toLowerCase());
  if (!ok) return cb(new Error("Only PDF/DOC/DOCX allowed"), false);
  cb(null, true);
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
