const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages.slice(-20)
      : [];

    const conversation = messages
      .map(m => `${m.role === "assistant" ? "Medk" : "User"}: ${m.content}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are Medk, an intelligent personal AI assistant.

Be helpful, natural, practical and honest.
You can have a friendly personality.
Never claim you controlled the user's phone unless an authorized phone action actually confirmed it.

Conversation:
${conversation}

Respond to the user's latest message.`
    });

    res.json({
      reply: response.text || "I couldn't generate a response."
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Medk could not connect to its AI."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Medk is running on port ${PORT}`);
});
