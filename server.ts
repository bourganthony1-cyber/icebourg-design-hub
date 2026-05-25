import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const app = express();
const PORT = 3001;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

const SYSTEM_PROMPT = `You are the official AI Assistant for IceBourg Designs. 
IceBourg Designs is a premium digital design studio specializing in UI/UX, 3D interaction, and high-end web development.

Your goals:
1. Provide helpful answers to FAQs.
2. If the user is interested in working with IceBourg, your priority is to CAPTURE their Name and Phone Number.
3. Keep the tone professional, minimalist, and "cool".
4. FAQ Reference:
   - Price: Do not give a specific price. Tell them that Mr. Bourg looks at each build differently and gives prices on an individual basis depending on the needs of the client.
   - Timeline: 2-6 weeks depending on complexity.
   - Services: UI/UX, Web Dev, 3D Scenes, Branding.
   - Location: Remote-first, based in the digital void (global).

When a user shows intent: "I'd love to help you get started. May I get your name and a phone number where our lead designer can reach you?"

CRITICAL INSTRUCTION: When you successfully collect BOTH the user's name and phone number, you MUST append a hidden JSON block at the very end of your response exactly in this format:
||LEAD:{"name":"<their name>", "phone":"<their phone>" }||

Always format your responses with Markdown.`;

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
        history: history || [],
      });

      const result = await chat.sendMessage({ message });
      let responseText = result.text;

      // Check for hidden lead tag
      const leadMatch = responseText?.match(/\|\|LEAD:(.*?)\|\|/);
      if (leadMatch) {
        try {
          const leadData = JSON.parse(leadMatch[1]);
          responseText = responseText.replace(leadMatch[0], "").trim();
          
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: process.env.EMAIL_USER,
              subject: `🚨 NEW LEAD: ${leadData.name} - IceBourg Designs`,
              text: `You have a new lead!\n\nName: ${leadData.name}\nPhone: ${leadData.phone}\n\nFollow up with them soon!`,
            });
            console.log("Lead email sent successfully.");
          }
        } catch (err) {
          console.error("Failed to parse lead or send email:", err);
        }
      }

      return res.json({ text: responseText });
    } catch (error: any) {
      attempts++;
      console.error(`Gemini Attempt ${attempts} failed:`, error);
      
      // If it's a 503 (service unavailable) or 429 (rate limit), retry after a short delay
      const statusCode = error?.status || error?.error?.code;
      if ((statusCode === 503 || statusCode === 429) && attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 500; // Exponential backoff: 1s, 2s, 4s...
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If we've exhausted retries or it's a different error
      const errorMessage = statusCode === 503 
        ? "The AI is currently under high demand. Please try again in a moment."
        : "Failed to communicate with AI. Please try again later.";
      
      return res.status(500).json({ error: errorMessage });
    }
  }
});

async function startServer() {
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

// Only start the server locally. Vercel will import the app object directly.
if (process.env.NODE_ENV !== "production" || process.env.RENDER || !process.env.VERCEL) {
  startServer();
}
