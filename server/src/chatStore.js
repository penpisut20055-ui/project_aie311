import { pool } from './db.js';

// เก็บในหน่วยความจำ เมื่อไม่มี DB (ข้อมูลหายเมื่อรีสตาร์ท)
const memory = new Map();

export async function saveMessage(sessionId, role, content) {
  if (!pool) {
    const list = memory.get(sessionId) || [];
    list.push({ role, content, created_at: new Date().toISOString() });
    memory.set(sessionId, list);
    return;
  }
  await pool.query(
    'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
    [sessionId, role, content],
  );
}

export async function getHistory(sessionId, limit = 20) {
  if (!pool) return (memory.get(sessionId) || []).slice(-limit);
  const { rows } = await pool.query(
    `SELECT role, content, created_at FROM (
       SELECT role, content, created_at, id FROM chat_messages
       WHERE session_id = $1 ORDER BY id DESC LIMIT $2
     ) t ORDER BY id ASC`,
    [sessionId, limit],
  );
  return rows;
}

export async function clearHistory(sessionId) {
  if (!pool) return void memory.delete(sessionId);
  await pool.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
}
