import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let groqClient: Groq | null = null;
let geminiClient: GoogleGenAI | null = null;

function getGroq() {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY || "";
    if (!key) {
      return null;
    }
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

function getGemini() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!key) {
      return null;
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

async function generateText(prompt: string, { jsonMode = false }: { jsonMode?: boolean } = {}) {
  const groq = getGroq();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text) return text;
    } catch (error) {
      console.warn("Groq failed, trying Gemini fallback", error);
    }
  }

  const gemini = getGemini();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        ...(jsonMode ? { config: { responseMimeType: "application/json" } } : {}),
      });
      if (response?.text) return response.text;
    } catch (error) {
      console.warn("Gemini 2.0 Flash failed, trying 1.5-flash fallback", error);
      try {
        const response15 = await gemini.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          ...(jsonMode ? { config: { responseMimeType: "application/json" } } : {}),
        });
        if (response15?.text) return response15.text;
      } catch (err2) {
        console.warn("Gemini 1.5 Flash failed", err2);
      }
    }
  }

  return "";
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { prompt } = req.body;
      const content = await generateText(prompt, { jsonMode: true });
      res.json(JSON.parse(content || "{}"));
    } catch (error: any) {
      console.error("AI Analyze Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/intelligence", async (req, res) => {
    try {
      const { prompt } = req.body;
      const text = await generateText(prompt);
      res.json({ text });
    } catch (error: any) {
      console.error("AI Intelligence Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, query } = req.body;
      const finalPrompt = prompt || query || "";
      const text = await generateText(finalPrompt);
      res.json({ text, response: text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
