const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");

/* Storage Config */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  }

});

/* File Filter */

const fileFilter = (req, file, cb) => {

  const allowed = ["application/pdf"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
