// สร้างตาราง + ใส่ข้อมูลจาก data/portfolio.json ลง PostgreSQL
// รันซ้ำได้: ข้อมูล portfolio จะถูกแทนที่ด้วยค่าล่าสุดในไฟล์ (ประวัติแชทไม่ถูกลบ)
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { pool } from '../src/db.js';
import { readPortfolioJson } from '../src/portfolio.js';

if (!pool) {
  console.error('กรุณาตั้งค่า DATABASE_URL ในไฟล์ .env ก่อน');
  process.exit(1);
}

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
const { group, members } = readPortfolioJson();
const client = await pool.connect();

try {
  await client.query(schema);
  await client.query('BEGIN');
  await client.query('TRUNCATE group_info, group_works, member_projects, members RESTART IDENTITY CASCADE');

  await client.query(
    'INSERT INTO group_info (name, concept, description, contact) VALUES ($1, $2, $3, $4)',
    [group.name, group.concept, group.description, group.contact || {}],
  );
  for (const w of group.works || []) {
    await client.query(
      'INSERT INTO group_works (title, description, tech, link) VALUES ($1, $2, $3, $4)',
      [w.title, w.description, w.tech || [], w.link || null],
    );
  }
  for (const [i, m] of members.entries()) {
    const { rows } = await client.query(
      `INSERT INTO members (name, nickname, student_id, role, bio, skills, image, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [m.name, m.nickname, m.student_id, m.role, m.bio, m.skills || [], m.image || null, i],
    );
    for (const p of m.projects || []) {
      await client.query(
        'INSERT INTO member_projects (member_id, title, description, link) VALUES ($1, $2, $3, $4)',
        [rows[0].id, p.title, p.description, p.link || null],
      );
    }
  }
  await client.query('COMMIT');
  console.log(`✅ ตั้งค่าฐานข้อมูลเรียบร้อย: กลุ่ม "${group.name}", สมาชิก ${members.length} คน`);
} catch (e) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('❌ ตั้งค่าฐานข้อมูลไม่สำเร็จ:', e.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
