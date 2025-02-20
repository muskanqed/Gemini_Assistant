const { Router } = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authMiddleware } = require("../middleware/authMiddleware");
dotenv.config();
const chatRouter = Router();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const Chat = require("../models/chatModel");

chatRouter.post("/create", authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                success: false,
                error: "Message must be a non-empty string",
            });
        }

        const chat = new Chat({
            userId: req.user._id,
            message: [
                {
                    sender: "user",
                    text: message,
                    timestamp: new Date(),
                },
            ],
        });

        const geminiChat = model.startChat({
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await geminiChat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();

        if (responseText) {
            chat.message.push({
                sender: "ai",
                text: responseText,
                timestamp: new Date(),
            });
        } else {
            console.warn("Gemini API returned an empty response.");
        }

        await chat.save();

        res.status(200).json({
            success: true,
            data: {
                message,
                response: responseText,
                timestamp: new Date(),
            },
        });
    } catch (error) {
        console.error("Gemini API error:", error);

        if (error.message?.includes("API key")) {
            return res.status(401).json({
                success: false,
                error: "Invalid API key configuration",
            });
        }

        if (error.message?.includes("quota")) {
            return res.status(429).json({
                success: false,
                error: "API quota exceeded",
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to process message",
        });
    }
});

chatRouter.get("/history", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const chats = await Chat.find({ userId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Chat.countDocuments({ userId });

        res.json({
            success: true,
            data: chats,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        console.error("History retrieval error:", error);
        res.status(500).json({
            error: "Failed to retrieve chat history",
            details:
                process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});

chatRouter.delete("/clear", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const { before, after } = req.query;
        const query = { userId };

        if (before || after) {
            query.timestamp = {};
            if (before) query.timestamp.$lt = new Date(before);
            if (after) query.timestamp.$gt = new Date(after);
        }

        const result = await Chat.deleteMany(query);

        res.json({
            success: true,
            message: "Chat history cleared",
            deleted: result.deletedCount,
        });
    } catch (error) {
        console.error("Clear history error:", error);
        res.status(500).json({
            error: "Failed to clear chat history",
        });
    }
});

module.exports = chatRouter;
