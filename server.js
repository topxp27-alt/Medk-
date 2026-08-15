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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Uploads
const uploadDir = path.join(__dirname, "uploads");

const upload = multer({
  dest: uploadDir
});

// Middleware
app.use(
  express.json({
    limit: "10mb"
  })
);

// IMPORTANT:
// Your index.html, app.js and style.css
// are all in the ROOT of your GitHub repo.
app.use(
  express.static(__dirname)
);

// ===============================
// SYSTEM CAPABILITIES
// ===============================

app.get("/api/capabilities", (req, res) => {
  res.json(getCapabilities());
});

// ===============================
// AI COMMAND
// ===============================

app.post("/api/command", async (req, res) => {
  try {
    const command = String(
      req.body?.command || ""
    );

    const result =
      await buildCommandResponse(command);

    res.json(result);

  } catch (error) {

    console.error(
      "Command error:",
      error
    );

    res.status(500).json({
      ok: false,
      error: "TopX could not process that command."
    });
  }
});

// ===============================
// IMAGE UPLOAD
// ===============================

app.post(
  "/api/image",
  upload.single("image"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          ok: false,
          error: "No image was supplied."
        });

      }

      res.json({
        ok: true,
        message:
          "Image received successfully.",
        file: req.file.filename,
        originalName:
          req.file.originalname
      });

    } catch (error) {

      console.error(
        "Image error:",
        error
      );

      res.status(500).json({
        ok: false,
        error:
          "TopX could not process the image."
      });
    }
  }
);

// ===============================
// YOUTUBE VIDEO PLAN
// ===============================

app.post(
  "/api/video-plan",
  async (req, res) => {

    try {

      const topic = String(
        req.body?.topic || ""
      ).trim();

      if (!topic) {

        return res.status(400).json({
          ok: false,
          error:
            "Please enter a video topic."
        });

      }

      const plan = {
        title:
          `${topic} — TopX AI`,

        hook:
          `Today we're looking at ${topic}.`,

        scenes: [
          "Opening hook",
          "Introduction",
          "Main content",
          "Examples / visuals",
          "Key points",
          "Conclusion",
          "Call to action"
        ],

        description:
          `A TopX AI video about ${topic}.`,

        status:
          "PLAN_READY"
      };

      res.json({
        ok: true,
        plan
      });

    } catch (error) {

      console.error(
        "Video plan error:",
        error
      );

      res.status(500).json({
        ok: false,
        error:
          "Could not create the video plan."
      });
    }
  }
);

// ===============================
// PUBLISH
// ===============================

app.post(
  "/api/publish",
  async (req, res) => {

    res.json({
      ok: false,
      status: "NOT_CONNECTED",
      message:
        "Your publishing account is not connected yet. Add the official platform credentials before publishing."
    });
  }
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {

  res.json({
    ok: true,
    service: "TopX AI",
    status: "ONLINE"
  });

});

// ===============================
// FRONTEND
// ===============================

// Because index.html is in the ROOT,
// serve it directly.
app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );

});

// ===============================
// START SERVER
// ===============================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `TopX AI running on port ${PORT}`
    );

  }
);
