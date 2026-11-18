import Modal, { askAI } from './Modal.jsx';

// หน้าต่างแสดงข้อมูลสมาชิกแบบเต็ม (เปิดเมื่อกดการ์ดสมาชิก)
export default function MemberModal({ member, avatar, onClose }) {
  const m = member;
  return (
    <Modal open={!!m} onClose={onClose} labelledBy="member-modal-title">
      {m && (
        <>
          <div className="modal-head">
            {avatar}
            <div>
              <h3 id="member-modal-title">{m.name}{m.nickname && <span className="muted"> ({m.nickname})</span>}</h3>
              <p className="role">{m.role}</p>
              {m.studentId && <p className="muted modal-sid">รหัสนักศึกษา {m.studentId}</p>}
            </div>
          </div>

          {m.bio && (
            <div className="modal-block">
              <h4>แนะนำตัว</h4>
              <p>{m.bio}</p>
            </div>
          )}

          {m.skills?.length > 0 && (
            <div className="modal-block">
              <h4>ทักษะ</h4>
              <div className="tags">{m.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            </div>
          )}

          {m.projects?.length > 0 && (
            <div className="modal-block">
              <h4>ผลงาน</h4>
              <ul className="modal-projects">
                {m.projects.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}</strong>
                    {p.description && <p className="muted">{p.description}</p>}
                    {p.tech?.length > 0 && <div className="tags">{p.tech.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer">ดูผลงาน →</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {m.extra?.length > 0 && (
            <div className="modal-block">
              <h4>ข้อมูลเพิ่มเติม</h4>
              <dl className="modal-extra">
                {m.extra.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            </div>
          )}

          <button className="btn modal-ask" onClick={() => askAI(`เล่าเกี่ยวกับ ${m.name} หน่อย ทำหน้าที่อะไรและมีผลงานอะไรบ้าง?`, onClose)}>
            💬 ถาม AI เกี่ยวกับ {m.nickname || m.name.split(/\s+/)[0]}
          </button>
        </>
      )}
    </Modal>
  );
}
