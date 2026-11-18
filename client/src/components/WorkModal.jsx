import Modal, { askAI } from './Modal.jsx';

// หน้าต่างแสดงรายละเอียดผลงานร่วมของกลุ่ม (เปิดเมื่อกดการ์ดผลงาน)
// "ใครทำส่วนไหน" ดึงจากผลงานของสมาชิกแต่ละคนที่มีชื่อผลงานนี้อยู่ เช่น "MANIFEST CHAT AI - Frontend"
export default function WorkModal({ work, members, onClose }) {
  const w = work;
  const parts = w
    ? members.flatMap((m) => (m.projects || [])
      .filter((p) => p.title.toLowerCase().includes(w.title.toLowerCase()))
      .map((p) => ({ member: m, part: p.title.slice(p.title.toLowerCase().indexOf(w.title.toLowerCase()) + w.title.length).replace(/^[\s\-–—:]+/, '') || m.role, detail: p.description })))
    : [];

  return (
    <Modal open={!!w} onClose={onClose} labelledBy="work-modal-title">
      {w && (
        <>
          <div className="modal-head work-head">
            <div className="work-icon" aria-hidden="true">✦</div>
            <div>
              <p className="eyebrow">ผลงานร่วมของกลุ่ม</p>
              <h3 id="work-modal-title">{w.title}</h3>
            </div>
          </div>

          {w.description && (
            <div className="modal-block">
              <h4>รายละเอียด</h4>
              <p>{w.description}</p>
            </div>
          )}

          {w.tech?.length > 0 && (
            <div className="modal-block">
              <h4>เทคโนโลยีที่ใช้</h4>
              <div className="tags">{w.tech.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          )}

          {parts.length > 0 && (
            <div className="modal-block">
              <h4>ใครทำส่วนไหน</h4>
              <ul className="modal-projects">
                {parts.map(({ member, part, detail }) => (
                  <li key={member.name + part}>
                    <strong>{member.nickname || member.name}</strong> <span className="role">· {part}</span>
                    {detail && <p className="muted">{detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {w.link && (
            <div className="modal-block">
              <a className="btn btn-ghost" href={w.link} target="_blank" rel="noreferrer">ดูผลงาน →</a>
            </div>
          )}

          <button className="btn modal-ask" onClick={() => askAI(`เล่าเกี่ยวกับผลงาน ${w.title} หน่อย ทำอะไรได้บ้าง ใช้เทคโนโลยีอะไร และใครทำส่วนไหน?`, onClose)}>
            💬 ถาม AI เกี่ยวกับผลงานนี้
          </button>
        </>
      )}
    </Modal>
  );
}
