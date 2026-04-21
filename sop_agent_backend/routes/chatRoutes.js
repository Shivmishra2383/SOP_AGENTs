const express = require("express");

const { askQuestion, getChatHistory, deleteChatSession } = require("../controllers/chatController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/history", verifyToken, getChatHistory);
router.delete("/history/:id", verifyToken, deleteChatSession);
router.post("/ask", verifyToken, askQuestion);

module.exports = router;
