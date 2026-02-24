const express = require("express");
const authMiddleware = require("../middleware/auth");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

const router = express.Router();

const typingStateByUser = new Map();
const TYPING_TTL_MS = 9000;

const normalizeRole = (value) => String(value || "").trim().toLowerCase();
const isAdmin = (role) => normalizeRole(role) === "admin";
const isUser = (role) => normalizeRole(role) === "user";

const toObjectIdString = (value) => String(value || "").trim();

const getTypingState = (userId) => {
  const key = toObjectIdString(userId);
  const current = typingStateByUser.get(key);

  if (!current) {
    return { userTyping: false, adminTyping: false };
  }

  if (Date.now() - current.updatedAt > TYPING_TTL_MS) {
    typingStateByUser.delete(key);
    return { userTyping: false, adminTyping: false };
  }

  return {
    userTyping: Boolean(current.userTyping),
    adminTyping: Boolean(current.adminTyping),
  };
};

const setTypingState = (userId, role, isTyping) => {
  const key = toObjectIdString(userId);
  const existing = getTypingState(key);
  const next = {
    ...existing,
    updatedAt: Date.now(),
  };

  if (normalizeRole(role) === "admin") {
    next.adminTyping = Boolean(isTyping);
  } else {
    next.userTyping = Boolean(isTyping);
  }

  typingStateByUser.set(key, next);
};

const getConversationUserId = (req, res) => {
  if (isAdmin(req.user?.role)) {
    const userId = toObjectIdString(req.query.userId);
    if (!userId) {
      res.status(400).json({ message: "userId is required for admin conversation view" });
      return null;
    }
    return userId;
  }

  return req.user._id.toString();
};

router.get("/messages", authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user?.role) && !isUser(req.user?.role)) {
      return res.status(403).json({ message: "Access denied for chat" });
    }

    const conversationUserId = getConversationUserId(req, res);
    if (!conversationUserId) {
      return;
    }

    const messages = await ChatMessage.find({ userId: conversationUserId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email role");

    if (isAdmin(req.user.role)) {
      await ChatMessage.updateMany(
        { userId: conversationUserId, senderRole: "user", seenStatus: false },
        { $set: { seenStatus: true } }
      );
    } else {
      await ChatMessage.updateMany(
        { userId: conversationUserId, senderRole: "admin", seenStatus: false },
        { $set: { seenStatus: true } }
      );
    }

    const refreshedMessages = await ChatMessage.find({ userId: conversationUserId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email role");

    const typingState = getTypingState(conversationUserId);

    return res.json({
      messages: refreshedMessages,
      typing: isAdmin(req.user.role) ? typingState.userTyping : typingState.adminTyping,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch chat messages" });
  }
});

router.post("/messages", authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user?.role) && !isUser(req.user?.role)) {
      return res.status(403).json({ message: "Access denied for chat" });
    }

    const senderRole = isAdmin(req.user?.role) ? "admin" : "user";
    const rawMessage = String(req.body?.message || "");
    const message = rawMessage.trim();

    if (!message) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const userId = senderRole === "admin" ? toObjectIdString(req.body?.userId) : req.user._id.toString();

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userExists = await User.findById(userId).select("_id");
    if (!userExists) {
      return res.status(404).json({ message: "Conversation user not found" });
    }

    const createdMessage = await ChatMessage.create({
      userId,
      senderId: req.user._id,
      senderRole,
      message,
      seenStatus: false,
    });

    setTypingState(userId, senderRole, false);

    const populatedMessage = await ChatMessage.findById(createdMessage._id).populate("senderId", "name email role");
    return res.status(201).json({ message: "Message sent", chatMessage: populatedMessage });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send message" });
  }
});

router.post("/typing", authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user?.role) && !isUser(req.user?.role)) {
      return res.status(403).json({ message: "Access denied for chat" });
    }

    const senderRole = isAdmin(req.user?.role) ? "admin" : "user";
    const isTyping = Boolean(req.body?.isTyping);
    const userId = senderRole === "admin" ? toObjectIdString(req.body?.userId) : req.user._id.toString();

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    setTypingState(userId, senderRole, isTyping);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update typing state" });
  }
});

router.get("/admin/conversations", authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user?.role)) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const allMessages = await ChatMessage.find({})
      .sort({ createdAt: -1 })
      .populate("senderId", "name email role");

    const summaryMap = new Map();

    allMessages.forEach((item) => {
      const userId = item.userId.toString();
      const existing = summaryMap.get(userId) || {
        userId,
        lastMessage: "",
        lastMessageAt: null,
        unreadCount: 0,
      };

      if (!existing.lastMessageAt) {
        existing.lastMessage = item.message;
        existing.lastMessageAt = item.createdAt;
      }

      if (item.senderRole === "user" && !item.seenStatus) {
        existing.unreadCount += 1;
      }

      summaryMap.set(userId, existing);
    });

    const userIds = Array.from(summaryMap.keys());
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const conversations = Array.from(summaryMap.values())
      .map((summary) => {
        const user = userMap.get(summary.userId);
        return {
          ...summary,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : { id: summary.userId, name: "Unknown user", email: "" },
        };
      })
      .sort((a, b) => {
        const left = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const right = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return right - left;
      });

    return res.json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch conversations" });
  }
});

router.delete("/messages/:id", authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user?.role)) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const deleted = await ChatMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.json({ message: "Message deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete message" });
  }
});

module.exports = router;
