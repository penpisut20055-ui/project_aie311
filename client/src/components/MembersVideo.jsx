import { useEffect, useRef, useState } from 'react';

// วิดีโอเปิดตัวสมาชิก: ไฟล์อยู่ที่ client/public/members.mp4 (เปลี่ยนเป็นวิดีโอจริงได้เลย)
// ตำแหน่งชื่อใต้แต่ละคนตอนจบวิดีโอ (% จากซ้าย) — ปรับให้ตรงกับตำแหน่งที่แต่ละคนยืนในวิดีโอ
const VIDEO_SRC = '/members.mp4';
const NAME_POSITIONS = [22, 50, 78];
// ลำดับคนในวิดีโอจากซ้ายไปขวา (จับคู่ด้วยชื่อจริง) — ถ้าหาไม่เจอจะใช้ลำดับจากข้อมูลแทน
const VIDEO_ORDER = ['จารุยา', 'เตชิน', 'เพ็ญพิศุทธิ์'];

const firstName = (m) => (m.name || '').trim().split(/\s+/)[0];

function orderForVideo(members) {
  const rest = [...members];
  const picked = VIDEO_ORDER.map((fn) => {
    const idx = rest.findIndex((m) => firstName(m) === fn);
    return idx === -1 ? null : rest.splice(idx, 1)[0];
  });
  // ช่องที่หาไม่เจอ เติมด้วยสมาชิกที่เหลือตามลำดับข้อมูล
  return picked.map((m) => m ?? rest.shift()).filter(Boolean);
}

export default function MembersVideo({ members, onDone }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  // idle = รอเลื่อนมาถึง, playing, ended, blocked = เบราว์เซอร์ไม่ให้เล่นเอง, error = ไม่มีไฟล์/โหลดไม่ได้
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (status === 'ended' || status === 'error') onDone?.();
  }, [status, onDone]);

  // เล่นเมื่อเลื่อนมาเห็นวิดีโอ
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || status !== 'idle') return;
    if (!('IntersectionObserver' in window)) { play(); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); play(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    const p = v.play();
    setStatus('playing');
    p?.catch(() => setStatus((s) => (s === 'error' ? s : 'blocked')));
  }

  if (status === 'error') return null;

  const ended = status === 'ended';
  const named = orderForVideo(members).slice(0, NAME_POSITIONS.length);
  return (
    // reveal อยู่ที่ div นอกสุดซึ่ง className ไม่เปลี่ยน (ไม่งั้น React จะลบคลาส visible ทิ้งตอน re-render)
    <div ref={wrapRef} className="reveal">
    <div className={`members-video ${ended ? 'is-ended' : ''}`}>
      <div className="mv-frame">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          onEnded={() => setStatus('ended')}
          onError={() => setStatus('error')}
          aria-label="วิดีโอแนะนำสมาชิกของกลุ่ม"
        />
        {status === 'blocked' && (
          <button className="mv-play" onClick={play} aria-label="เล่นวิดีโอ">▶</button>
        )}
        {ended && (
          <button className="mv-replay btn btn-sm" onClick={play} aria-label="ดูวิดีโออีกครั้ง">▶ ดูอีกครั้ง</button>
        )}
        {/* ชื่ออยู่ในพื้นที่ว่างด้านล่างของวิดีโอ ใต้รูปแต่ละคน (รูปอยู่ช่วงบน ~2/3 ของเฟรม) */}
        <div className="mv-names" aria-hidden={!ended}>
          {named.map((m, i) => (
            <div key={m.name} className="mv-name" style={{ left: `${NAME_POSITIONS[i]}%`, '--i': i }}>
              <strong>{m.nickname || firstName(m)}</strong>
              <span>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
