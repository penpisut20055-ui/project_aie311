import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const JSON_PATH = fileURLToPath(new URL('../data/portfolio.json', import.meta.url));

export function readPortfolioJson() {
  return JSON.parse(readFileSync(JSON_PATH, 'utf8'));
}

// อ่านข้อมูล portfolio จาก PostgreSQL (หรือจากไฟล์ JSON ถ้าไม่มี DB)
export async function getPortfolio() {
  if (!pool) return readPortfolioJson();

  const [g, works, members, projects] = await Promise.all([
    pool.query('SELECT name, concept, description, contact FROM group_info ORDER BY id LIMIT 1'),
    pool.query('SELECT title, description, tech, link FROM group_works ORDER BY id'),
    pool.query('SELECT id, name, nickname, student_id, role, bio, skills, image FROM members ORDER BY sort_order, id'),
    pool.query('SELECT member_id, title, description, link FROM member_projects ORDER BY id'),
  ]);

  return {
    group: { ...(g.rows[0] || { name: '', concept: '', description: '', contact: {} }), works: works.rows },
    members: members.rows.map(({ id, ...m }) => ({
      ...m,
      projects: projects.rows
        .filter((p) => p.member_id === id)
        .map(({ member_id, ...p }) => p),
    })),
  };
}
