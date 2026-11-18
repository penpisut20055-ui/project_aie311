import { useEffect, useRef } from 'react';

// กรอบหน้าต่างป๊อปอัปที่ใช้ร่วมกัน (สมาชิก / ผลงานกลุ่ม)
// ปิดได้ด้วยปุ่ม ✕, Esc หรือคลิกพื้นหลัง; กด Tab วนอยู่ในหน้าต่าง; ปิดแล้ว focus กลับไปที่การ์ดเดิม
export default function Modal({ open, onClose, labelledBy, children }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
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
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="ปิด">✕</button>
        {children}
      </div>
    </div>
  );
}

// ปิดหน้าต่าง แล้วส่งคำถามไปที่แชท (Chat.jsx ฟัง event 'ask-ai') และเลื่อนลงไปที่แชท
export function askAI(question, onClose) {
  onClose();
  window.dispatchEvent(new CustomEvent('ask-ai', { detail: question }));
  setTimeout(() => document.querySelector('a[href="#chat"]')?.click(), 50);
}
