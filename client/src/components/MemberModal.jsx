import { useEffect, useRef } from 'react';

// หน้าต่างแสดงข้อมูลสมาชิกแบบเต็ม (เปิดเมื่อกดการ์ดสมาชิก)
export default function MemberModal({ member, avatar, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!member) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      // กด Tab แล้ววนอยู่ในหน้าต่างนี้ (ไม่หลุดไปข้างหลัง)
      if (e.key === 'Tab') {
        const els = [...document.querySelectorAll('.modal button, .modal a[href]')];
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [member, onClose]);

  if (!member) return null;
  const m = member;

  function askAI() {
    onClose();
    // ส่งคำถามไปที่หน้าแชท (Chat.jsx ฟัง event นี้อยู่) แล้วเลื่อนไปที่แชท
    window.dispatchEvent(new CustomEvent('ask-ai', { detail: `เล่าเกี่ยวกับ ${m.name} หน่อย ทำหน้าที่อะไรและมีผลงานอะไรบ้าง?` }));
    setTimeout(() => document.querySelector('a[href="#chat"]')?.click(), 50);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="ปิด">✕</button>

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
            <div className="tags">{m.skills.map((s, i) => <span key={s} className="tag" style={{ '--i': i }}>{s}</span>)}</div>
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

        <button className="btn modal-ask" onClick={askAI}>💬 ถาม AI เกี่ยวกับ {m.nickname || m.name.split(/\s+/)[0]}</button>
      </div>
    </div>
  );
}
