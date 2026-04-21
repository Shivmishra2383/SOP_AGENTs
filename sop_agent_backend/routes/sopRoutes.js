const express = require("express");

const {uploadSOP,getAllSOP,deleteSOP} = require("../controllers/sopController");

const upload = require("../middleware/uploadMiddleware");

const {verifyToken,isAdmin} = require("../middleware/authMiddleware");

const router = express.Router();

/* Upload SOP */

router.post("/upload", verifyToken, upload.single("file"), uploadSOP);

/* Get SOPs */

router.get("/", verifyToken, getAllSOP);

/* Delete SOP */

router.delete("/:id", verifyToken, isAdmin, deleteSOP);

module.exports = router;
