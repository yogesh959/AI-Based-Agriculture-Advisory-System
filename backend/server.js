const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const path = require("path");
const OpenAI = require("openai");

dotenv.config({ path: path.join(__dirname, ".env") });

const database = require("./db");

const openRouterApiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env["openrouter.api.key"] ||
    process.env.OPENAI_API_KEY;

console.log("OpenRouter key loaded:", openRouterApiKey ? "YES" : "NO");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const client = new OpenAI({
    apiKey: openRouterApiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Farming AI Assistant"
    }
});

async function persistAssistantHistory(record) {
    try {
        await database.saveHistory(record);
        return true;
    } catch (error) {
        console.error("Could not save assistant history:", error.code || "UNKNOWN");
        return false;
    }
}

function getResponseLanguageInstruction(language) {
    if (language === "Hindi") return "Respond in Hindi.";
    if (language === "Telugu") return "Respond in Telugu.";
    return "Respond in English.";
}

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/db-health", async (_req, res) => {
    try {
        const result = await database.checkConnection();
        return res.status(result.status === "connected" ? 200 : 503).json(result);
    } catch (error) {
        console.error("MySQL connectivity check failed:", error.code || "UNKNOWN");
        return res.status(503).json({
            status: "disconnected",
            error: error.code || "connection_failed"
        });
    }
});

app.get("/history", async (req, res) => {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), 100)
        : 50;
    const allowedTypes = new Set(["crop", "image"]);
    const entryTypes = req.query.type
        ? String(req.query.type).split(",").filter((type) => allowedTypes.has(type))
        : ["crop", "image"];
    if (req.query.type && entryTypes.length === 0) {
        return res.status(400).json({ error: "Invalid history type." });
    }

    try {
        const history = await database.getHistory(limit, entryTypes);
        return res.json({ history });
    } catch (error) {
        console.error("Could not load assistant history:", error.code || "UNKNOWN");
        return res.status(503).json({ error: "Assistant history is unavailable." });
    }
});

app.delete("/history", async (req, res) => {
    const { ids, entryType } = req.body || {};
    const allowedTypes = new Set(["crop", "image"]);
    if (!allowedTypes.has(entryType) || !Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
        return res.status(400).json({ error: "Select between 1 and 100 saved records to delete." });
    }

    const normalizedIds = [...new Set(ids.map(String))];
    const validIds = normalizedIds.every((id) => {
        if (!/^[1-9]\d{0,19}$/.test(id)) return false;
        const value = BigInt(id);
        return value <= 18446744073709551615n;
    });
    if (!validIds) {
        return res.status(400).json({ error: "Invalid history record IDs." });
    }

    try {
        const deleted = await database.deleteHistory(normalizedIds, entryType);
        return res.json({ deleted });
    } catch (error) {
        console.error("Could not delete assistant history:", error.code || "UNKNOWN");
        return res.status(503).json({ error: "Selected history could not be deleted." });
    }
});

app.post("/crop-history", async (req, res) => {
    const { soil, water, season, previousCrop, location, crop, confidence, reason } = req.body || {};
    const requiredText = [soil, water, season, previousCrop, crop, reason];
    if (requiredText.some((value) => typeof value !== "string" || !value.trim())) {
        return res.status(400).json({ error: "Missing crop recommendation details." });
    }
    if (typeof confidence !== "number" || confidence < 0 || confidence > 100) {
        return res.status(400).json({ error: "Invalid confidence value." });
    }

    const question = [
        `Soil: ${soil.trim()}`,
        `Water: ${water.trim()}`,
        `Season: ${season.trim()}`,
        `Previous crop: ${previousCrop.trim()}`,
        `Location: ${typeof location === "string" && location.trim() ? location.trim() : "Your Farm"}`
    ].join("; ");
    const answer = `Recommended crop: ${crop.trim()}\nConfidence: ${confidence}%\nReason: ${reason.trim()}`;
    const historySaved = await persistAssistantHistory({
        question,
        answer,
        entryType: "crop"
    });

    if (!historySaved) {
        return res.status(503).json({ error: "Crop recommendation could not be saved." });
    }
    return res.status(201).json({ saved: true });
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body?.message;
        if (!userMessage) {
            return res.status(400).json({ answer: "Missing message field" });
        }

        const response = await client.chat.completions.create({
            model: "openai/gpt-4.1-mini",
            max_tokens: 1200,
            messages: [
                {
                    role: "system",
                    content: `You are a friendly agriculture assistant that gives clear, simple advice for farmers. Keep answers short and practical. ${getResponseLanguageInstruction(req.body?.language)}`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        const answer = response.choices?.[0]?.message?.content || "No answer returned.";
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ answer: error.message || "AI request failed" });
    }
});

app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedImageTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ answer: "Please upload a JPG, PNG, WebP, or GIF image." });
        }

        const base64Image = req.file.buffer.toString("base64");
        const userQuestion = req.body?.message?.trim() ||
            "Analyze this crop photo. Describe visible health issues and practical next steps.";

        const response = await client.chat.completions.create({
            model: "openai/gpt-4.1-mini",
            max_tokens: 1200,
            messages: [
                {
                    role: "system",
                    content: `You are a friendly agriculture assistant. Analyze crop photos carefully, distinguish visible evidence from possibilities, and give practical advice in simple farmer language. Do not claim certainty from an image alone. ${getResponseLanguageInstruction(req.body?.language)}`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: userQuestion
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${req.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ]
        });

        const answer = response.choices?.[0]?.message?.content || "No analysis returned.";
        if (req.body?.source === "assistant") {
            return res.json({ answer });
        }

        const historySaved = await persistAssistantHistory({
            question: userQuestion,
            answer,
            entryType: "image",
            imageName: req.file.originalname.slice(0, 255)
        });
        return res.json({ answer, historySaved });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            answer: error.message
        });
    }
});

app.use((error, _req, res, _next) => {
    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ answer: "Image must be 10 MB or smaller." });
    }
    console.error(error);
    return res.status(400).json({ answer: error.message || "Request could not be processed." });
});

async function startServer() {
    try {
        const historyReady = await database.initializeHistoryTable();
        if (historyReady) console.log("MySQL assistant history table ready");
    } catch (error) {
        console.error("Could not initialize assistant history:", error.code || "UNKNOWN");
    }

    app.listen(5000, () => {
        console.log("OpenRouter AI server running on port 5000");
    });
}

startServer();