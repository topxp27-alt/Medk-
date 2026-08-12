const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(express.static(__dirname));

function requireKey(res) {
  if (!GEMINI_API_KEY) {
    res.status(500).json({
      error: "GEMINI_API_KEY is not set on the server."
    });
    return false;
  }
  return true;
}

async function callGemini(parts) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=` +
    `${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Gemini returned HTTP ${response.status}`;

    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  return text || "I didn't get a response from Gemini.";
}

app.get("/", (req, res) => {
  const voicePage = path.join(__dirname, "medk_voice.html");
  const indexPage = path.join(__dirname, "index.html");

  res.sendFile(voicePage, err => {
    if (err) {
      res.sendFile(indexPage);
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    medk: "online"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!requireKey(res)) return;

    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages.slice(-20)
      : [];

    const conversation = messages
      .map(m =>
        `${m?.role === "assistant" ? "Medk" : "User"}: ${String(
          m?.content || ""
        )}`
      )
      .join("\n");

    const reply = await callGemini([
      {
        text: `You are Medk, a friendly personal AI assistant.
Speak naturally and concisely. Your replies may be read aloud.
Do not claim you performed actions you cannot actually perform.

Continue this conversation and answer the user's latest message:

${conversation}`
      }
    ]);

    res.json({
      reply
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Medk could not connect to the AI.",
      details: error.message
    });
  }
});

app.post("/api/voice", async (req, res) => {
  try {
    if (!requireKey(res)) return;

    const audio = req.body?.audio;

    const mimeType = String(
      req.body?.mimeType || "audio/webm"
    )
      .split(";")[0]
      .trim();

    if (!audio || typeof audio !== "string") {
      return res.status(400).json({
        error: "No audio was received."
      });
    }

    const base64Audio = audio.replace(
      /^data:[^;]+;base64,/,
      ""
    );

    const reply = await callGemini([
      {
        inline_data: {
          mime_type: mimeType,
          data: base64Audio
        }
      },
      {
        text: `You are Medk.

Listen to the user's audio, understand what they said,
and answer them naturally.

Return ONLY the natural reply to the user.
Do not return a transcription.
Do not explain how you processed the audio.
Keep the reply reasonably concise because it will be spoken aloud.`
      }
    ]);

    res.json({
      reply
    });
  } catch (error) {
    console.error("Voice error:", error);

    res.status(500).json({
      error: "Medk could not process your voice.",
      details: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    error: "Server error."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Medk running on port ${PORT}`);
});
