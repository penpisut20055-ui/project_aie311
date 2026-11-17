// สร้าง system prompt จากข้อมูล portfolio เพื่อให้ Gemini ตอบจากข้อมูลจริงของกลุ่ม
export function buildSystemPrompt(portfolio) {
  const { group, members } = portfolio;
  const list = (arr) => (arr && arr.length ? arr.join(', ') : '-');

  const works = (group.works || [])
    .map((w, i) => `  ${i + 1}. ${w.title}: ${w.description || ''} (เทคโนโลยี: ${list(w.tech)})${w.link ? ` ลิงก์: ${w.link}` : ''}`)
    .join('\n');

  const memberText = members
    .map((m, i) => {
      const projects = (m.projects || [])
        .map((p) => `     - ${p.title}: ${p.description || ''}${p.link ? ` (${p.link})` : ''}`)
        .join('\n');
      return [
        `${i + 1}. ${m.name}${m.nickname ? ` (ชื่อเล่น: ${m.nickname})` : ''}`,
        `   บทบาท: ${m.role || '-'}`,
        `   แนะนำตัว: ${m.bio || '-'}`,
        `   ทักษะ: ${list(m.skills)}`,
        `   ผลงาน:\n${projects || '     -'}`,
      ].join('\n');
    })
    .join('\n\n');

  const contact = Object.entries(group.contact || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return `คุณคือผู้ช่วย AI ประจำเว็บไซต์ Portfolio ของกลุ่ม "${group.name}"
หน้าที่ของคุณคือตอบคำถามเกี่ยวกับกลุ่มและสมาชิกแต่ละคน โดยใช้ข้อมูลด้านล่างนี้เท่านั้น

กฎ:
- ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม (ไทยหรืออังกฤษ) สุภาพ กระชับ เป็นกันเอง
- ใช้เฉพาะข้อมูลด้านล่าง ห้ามแต่งข้อมูลที่ไม่มี ถ้าไม่มีข้อมูลให้บอกตรง ๆ ว่าไม่ทราบ และแนะนำให้ติดต่อกลุ่ม
- ถ้าถูกถามเรื่องที่ไม่เกี่ยวกับกลุ่มเลย ให้ตอบสั้น ๆ แล้วชวนกลับมาคุยเรื่องกลุ่ม

=== ข้อมูลกลุ่ม ===
ชื่อกลุ่ม: ${group.name}
แนวคิดของทีม: ${group.concept || '-'}
คำอธิบาย: ${group.description || '-'}
ช่องทางติดต่อ: ${contact || '-'}
ผลงานร่วมของกลุ่ม:
${works || '  -'}

=== สมาชิก (${members.length} คน) ===
${memberText}`;
}
