import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

delete process.env.DATABASE_URL;
delete process.env.GEMINI_API_KEY;
const { createApp } = await import('../src/app.js');
const { buildSystemPrompt } = await import('../src/prompt.js');
const { readPortfolioJson } = await import('../src/portfolio.js');

const app = createApp();

test('system prompt มีข้อมูลกลุ่มและสมาชิกทุกคน', () => {
  const data = readPortfolioJson();
  const prompt = buildSystemPrompt(data);
  assert.ok(prompt.includes(data.group.name));
  for (const m of data.members) assert.ok(prompt.includes(m.name));
});

test('GET /api/portfolio คืนข้อมูลกลุ่ม', async () => {
  const res = await request(app).get('/api/portfolio').expect(200);
  assert.ok(res.body.group.name);
  assert.ok(Array.isArray(res.body.members));
});

test('POST /api/chat ตอบกลับและบันทึกประวัติ', async () => {
  const res = await request(app).post('/api/chat').send({ sessionId: 't1', message: 'สวัสดี' }).expect(200);
  assert.ok(res.body.reply);
  const hist = await request(app).get('/api/chat/t1').expect(200);
  assert.deepEqual(hist.body.map((m) => m.role), ['user', 'model']);
});

test('POST /api/chat ปฏิเสธข้อความว่าง', async () => {
  await request(app).post('/api/chat').send({ sessionId: 't1', message: '  ' }).expect(400);
});
