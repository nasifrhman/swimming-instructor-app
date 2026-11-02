const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = function createUploader(UPLOADS_FOLDER) {
  if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(UPLOADS_FOLDER)) {
        fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
      }
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname || "") || "";
      const baseName = path
        .basename(file.originalname || "file", fileExt)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase() || "file";
      const filename = `${baseName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

      cb(null, filename);
    },
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 500 * 1024 * 1024,
      fieldSize: 50 * 1024 * 1024,
      files: 50,
    },
    fileFilter: (req, file, cb) => {
      cb(null, true);
    },
  });
};

