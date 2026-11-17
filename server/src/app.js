import express from 'express';
import cors from 'cors';
import { getPortfolio } from './portfolio.js';
import { buildSystemPrompt } from './prompt.js';
import { askGemini } from './gemini.js';
import { saveMessage, getHistory, clearHistory } from './chatStore.js';
import { hasDb } from './db.js';

export function createApp() {
  const app = express();
  const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
  app.use(cors({ origin: origins.includes('*') ? '*' : origins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, db: hasDb() }));

  // ข้อมูล portfolio สำหรับหน้าเว็บ
  app.get('/api/portfolio', async (_req, res, next) => {
    try {
      res.json(await getPortfolio());
    } catch (e) {
      next(e);
    }
  });

  // ดึงประวัติแชทของ session
  app.get('/api/chat/:sessionId', async (req, res, next) => {
    try {
      res.json(await getHistory(req.params.sessionId, 100));
    } catch (e) {
      next(e);
    }
  });

  app.delete('/api/chat/:sessionId', async (req, res, next) => {
    try {
      await clearHistory(req.params.sessionId);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  // ส่งข้อความหา AI
  app.post('/api/chat', async (req, res, next) => {
    try {
      const { sessionId, message } = req.body || {};
      if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 100) {
        return res.status(400).json({ error: 'sessionId ไม่ถูกต้อง' });
      }
      if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
        return res.status(400).json({ error: 'ข้อความต้องไม่ว่างและยาวไม่เกิน 2000 ตัวอักษร' });
      }

      await saveMessage(sessionId, 'user', message.trim());
      const history = await getHistory(sessionId, 20);
      const systemPrompt = buildSystemPrompt(await getPortfolio());
      const reply = await askGemini(systemPrompt, history);
      await saveMessage(sessionId, 'model', reply);

      res.json({ reply });
    } catch (e) {
      next(e);
    }
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  });

  return app;
}
