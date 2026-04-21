const ChatSession = require("../models/ChatSession");
const askAI = require("../services/ragService");
const { canAccessSop, getAccessibleSopIds } = require("../utils/accessControl");

exports.askQuestion = async (req, res) => {
  try {
    const { question, sopId, topK, sessionId } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        message: "Valid question is required"
      });
    }

    if (sopId) {
      const hasAccess = await canAccessSop(req.user, sopId);
      if (!hasAccess) {
        return res.status(403).json({
          message: "You do not have access to that SOP."
        });
      }
    }

    const accessibleSopIds = await getAccessibleSopIds(req.user);
    const result = await askAI({
      question,
      sopId,
      topK: topK || 5,
      allowedSopIds: accessibleSopIds
    });

    let session = null;
    const titleSeed = question.trim().slice(0, 80);

    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        user: req.user._id
      });
    }

    if (!session) {
      session = await ChatSession.create({
        title: titleSeed || "New conversation",
        user: req.user._id,
        sopId: sopId || null,
        messages: []
      });
    }

    session.title = session.title || titleSeed || "New conversation";
    session.sopId = sopId || session.sopId || null;
    session.messages.push({
      role: "user",
      text: question
    });
    session.messages.push({
      role: "assistant",
      text: result.answer,
      sources: result.sources || []
    });
    await session.save();

    res.status(200).json({
      success: true,
      sessionId: session._id,
      question,
      answer: result.answer,
      sources: result.sources || [],
      modelAvailable: result.modelAvailable
    });
  } catch (error) {
    console.error("Ask Question error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .populate("sopId", "title")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json(
      sessions.map((session) => ({
        _id: session._id,
        title: session.title,
        sopId: session.sopId?._id || null,
        sopTitle: session.sopId?.title || null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages || []
      }))
    );
  } catch (error) {
    console.error("Get Chat History error:", error);
    res.status(500).json({
      message: error.message || "Failed to load chat history"
    });
  }
};

exports.deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        message: "Chat session not found"
      });
    }

    res.status(200).json({
      message: "Chat session deleted successfully",
      sessionId: req.params.id
    });
  } catch (error) {
    console.error("Delete Chat Session error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete chat session"
    });
  }
};
