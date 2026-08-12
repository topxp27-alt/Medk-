const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Show Medk's website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const OpenAI = require("openai");
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: message
    });

    res.json({
      reply: response.output_text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Medk could not respond"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Medk running on port ${PORT}`);
});
