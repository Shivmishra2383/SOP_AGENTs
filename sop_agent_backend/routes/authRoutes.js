const express = require("express");

const {registerUser,loginUser,getProfile} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/* Register */

router.post("/register", registerUser);

/* Login */

router.post("/login", loginUser);

/* Profile */

router.get("/profile", verifyToken, getProfile);

module.exports = router;