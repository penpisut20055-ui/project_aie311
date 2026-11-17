import 'dotenv/config';
import { createApp } from './app.js';
import { hasDb } from './db.js';

const port = process.env.PORT || 3001;
createApp().listen(port, () => {
  console.log(`API พร้อมที่ http://localhost:${port}`);
  if (!hasDb()) console.warn('⚠️  ไม่ได้ตั้ง DATABASE_URL — ใช้โหมดหน่วยความจำ (แชทไม่ถูกบันทึกถาวร)');
  if (!process.env.GEMINI_API_KEY) console.warn('⚠️  ไม่ได้ตั้ง GEMINI_API_KEY — AI จะตอบแบบโหมดทดลอง');
});
