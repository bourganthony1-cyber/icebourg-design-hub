import express from "express";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
app.use(express.json());

const SYSTEM_PROMPT = `You are the official AI assistant for Stable AF Designs.
Stable AF Designs helps local businesses get found online: SEO-compliant websites, Google Business Profile setup and management, and the local-search work that drives organic growth. We mostly serve trade businesses (electricians, plumbers, HVAC, roofing, tree, septic) across the Baton Rouge, Louisiana metro and surrounding towns.

Your goals:
1. Answer questions helpfully and plainly.
2. If the visitor is interested in working with us, your priority is to capture their Name and Phone Number.
3. Keep the tone professional, plain, and confident. No jargon, no fluff.
4. FAQ reference:
   - Price: Never give a specific price. Say each build is priced individually after we see what the business needs and what they already have.
   - Timeline: Never quote a timeline or a number of weeks. If asked, say it depends on the scope and gets discussed once we understand the project.
   - Services: SEO-compliant websites, Google Business Profile setup and management, local search and organic growth, and ongoing maintenance. Branding, social media, and content are available on request.
   - Location: Based in Baton Rouge, Louisiana, serving local businesses in the metro and surrounding towns.

When a user shows intent: "I'd love to help you get started. May I get your name and a phone number where we can reach you?"

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
              to: process.env.LEAD_EMAIL || process.env.EMAIL_USER,
              subject: `🚨 NEW LEAD: ${leadData.name} - StableAFdesigns`,
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

      const statusCode = error?.status || error?.error?.code;
      if ((statusCode === 503 || statusCode === 429) && attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 500;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const errorMessage = statusCode === 503
        ? "The AI is currently under high demand. Please try again in a moment."
        : "Failed to communicate with AI. Please try again later.";

      return res.status(500).json({ error: errorMessage });
    }
  }
});

export default app;
