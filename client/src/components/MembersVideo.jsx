import { useEffect, useRef, useState } from 'react';

// วิดีโอเปิดตัวสมาชิก: ไฟล์อยู่ที่ client/public/members.mp4 (เปลี่ยนเป็นวิดีโอจริงได้เลย)
// ตำแหน่งชื่อใต้แต่ละคนตอนจบวิดีโอ (% จากซ้าย) — ปรับให้ตรงกับตำแหน่งที่แต่ละคนยืนในวิดีโอ
const VIDEO_SRC = '/members.mp4';
const NAME_POSITIONS = [22, 50, 78];

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
          <button className="mv-replay btn btn-sm" onClick={play}>▶ ดูอีกครั้ง</button>
        )}
      </div>
      <div className="mv-names" aria-hidden={!ended}>
        {members.slice(0, NAME_POSITIONS.length).map((m, i) => (
          <div key={m.name} className="mv-name" style={{ left: `${NAME_POSITIONS[i]}%`, '--i': i }}>
            <strong>{m.nickname || m.name}</strong>
            <span>{m.role}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
