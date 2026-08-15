import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildCommandResponse,
  getCapabilities
} from "./topx-engine.js";

dotenv.config();

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  dest: path.join(__dirname, "uploads")
});

app.use(express.json({ limit: "2mb" }));

app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);

app.get("/api/capabilities", (_, res) => {
  res.json(getCapabilities());
});

app.post("/api/command", async (req, res) => {
  try {
    const result = await buildCommandResponse(
      String(req.body.command || "")
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.post("/api/image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      error: "No image supplied"
    });
  }

  res.json({
    ok: true,
    message:
      "Image received. Connect your vision model in topx-engine.js to analyze it.",
    file: req.file.filename
  });
});

app.post("/api/video-plan", async (req, res) => {
  const topic = String(req.body.topic || "");

  if (!topic) {
    return res.status(400).json({
      ok: false,
      error: "Topic required"
    });
  }

  res.json({
    ok: true,
    plan: {
      title: `${topic} — TopX`,
      hook: `Here's what you need to know about ${topic}.`,
      scenes: [
        "Hook / title card",
        "Main explanation",
        "Visual examples",
        "Quick recap",
        "Call to action"
      ],
      description:
        `A TopX AI video about ${topic}.`,
      status: "PLAN_READY"
    }
  });
});

app.post("/api/publish", async (req, res) => {
  res.json({
    ok: false,
    status: "NOT_CONNECTED",
    message:
      "Publishing requires a connected official platform account and credentials."
  });
});

app.get("*", (_, res) => {
  res.sendFile(
    path.join(__dirname, "../public/index.html")
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `TopX AI running on http://localhost:${PORT}`
  );
});
