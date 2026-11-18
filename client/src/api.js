// เรียก API ของ backend (โฟลเดอร์ backend/) แล้วแปลงข้อมูลให้อยู่ในรูปแบบที่หน้าเว็บใช้
// ถ้า backend เปลี่ยนชื่อ field แก้ที่ไฟล์นี้ไฟล์เดียว คอมโพเนนต์อื่นไม่ต้องแก้
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const toProject = (p = {}) => ({
  title: p.title ?? p.name ?? '',
  description: p.description ?? p.detail ?? '',
  tech: p.tech || [],
  link: p.link || '',
});

// field อื่น ๆ ของสมาชิกที่ backend ส่งมา (ข้อความ/ตัวเลขสั้น ๆ) จะแสดงในหัวข้อ "ข้อมูลเพิ่มเติม" ของหน้าต่างสมาชิก
const KNOWN_MEMBER_KEYS = new Set(['id', 'name', 'nickname', 'role', 'bio', 'skills', 'image', 'projects', 'student_id', 'studentId', 'sort_order', 'created_at']);
const memberExtras = (m) => ({
  extra: Object.entries(m).filter(([k, v]) => !KNOWN_MEMBER_KEYS.has(k) && (typeof v === 'string' || typeof v === 'number') && String(v).trim() !== ''),
});

// backend: { group: { group_name, concept, highlights, group_projects, contact }, members: [{ name, role, skills, projects: [{ name, detail }] }] }
// หน้าเว็บ: { group: { name, concept, description, works, contact }, members: [{ name, nickname, role, bio, skills, image, projects: [{ title, description, link }] }] }
function toPortfolio({ group, members } = {}) {
  const g = group || {};
  return {
    group: {
      name: g.group_name ?? g.name ?? 'Portfolio',
      concept: g.concept || '',
      description: g.description ?? g.highlights ?? '',
      contact: g.contact || {},
      works: (g.group_projects ?? g.works ?? []).map(toProject),
    },
    members: (members || []).map((m) => ({
      ...memberExtras(m),
      name: m.name,
      nickname: m.nickname || '',
      role: m.role || '',
      bio: m.bio || '',
      skills: m.skills || [],
      image: m.image || '',
      studentId: m.student_id ?? m.studentId ?? '',
      projects: (m.projects || []).map(toProject),
    })),
  };
}

const toMessage = (m) => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content });

// backend ใช้ sessionId แยกประวัติและการล้างแชทของแต่ละ session
const q = (sessionId) => `?sessionId=${encodeURIComponent(sessionId)}`;

export const getPortfolio = () => request('/portfolio').then(toPortfolio);
export const getHistory = (sessionId) => request(`/chat${q(sessionId)}`).then((rows) => (Array.isArray(rows) ? rows.map(toMessage) : []));
export const clearHistory = (sessionId) => request(`/chat${q(sessionId)}`, { method: 'DELETE' });
export const sendMessage = (sessionId, message) =>
  request('/chat', { method: 'POST', body: JSON.stringify({ sessionId, message }) });
