import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint for Gemini AI consultation
  app.post('/api/gemini/consult', async (req: express.Request, res: express.Response): Promise<void> => {
    const { prompt, systemInstruction, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(200).json({
        text: "کلید API برای مدل هوش مصنوعی Gemini تنظیم نشده است.\n\nلطفاً از طریق پانل **Settings > Secrets** در استودیو، متغیر `GEMINI_API_KEY` را تنظیم کنید تا امکان مشاوره هوشمند فعال شود."
      });
      return;
    }

    try {
      // Modern GenAI SDK Initialization with Telemetry header
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const fullPrompt = context 
        ? `${context}\n\nپرسش کاربر:\n${prompt}` 
        : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: systemInstruction || "You are a professional life planner and advisor.",
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API call failed:', error);
      res.status(500).json({ 
        error: error.message || 'خطایی در ارتباط با سرور هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.' 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite Middleware Setup
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start fullstack server:', err);
});
