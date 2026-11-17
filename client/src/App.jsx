import { useEffect, useState } from 'react';
import { getPortfolio } from './api.js';
import Portfolio from './components/Portfolio.jsx';
import Chat from './components/Chat.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    getPortfolio().then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // อนิเมชั่นตอนเลื่อนหน้าจอ: ใส่คลาส visible ให้ element ที่มีคลาส reveal เมื่อเลื่อนมาถึง
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data]);

  // กดเมนู/ปุ่มที่ลิงก์ไป #section: เลื่อนแบบนุ่ม ๆ (ease-in-out) แล้วหัวข้อปลายทางเด้งเบา ๆ
  useEffect(() => {
    const NAV_H = 64;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf;
    function onClick(e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const startY = window.scrollY;
      const endY = id === 'top' ? 0 : target.getBoundingClientRect().top + startY - NAV_H;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const duration = reduce ? 0 : Math.min(1100, 450 + Math.abs(endY - startY) * 0.25);
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      const step = (now) => {
        const t = duration ? Math.min(1, (now - t0) / duration) : 1;
        window.scrollTo(0, startY + (endY - startY) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else {
          history.replaceState(null, '', `#${id}`);
          const h = target.querySelector('h2');
          if (h) { h.classList.remove('arrive'); void h.offsetWidth; h.classList.add('arrive'); }
        }
      };
      raf = requestAnimationFrame(step);
    }
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); cancelAnimationFrame(raf); };
  }, []);

  // ไฮไลต์เมนูของ section ที่กำลังดูอยู่ + แถบความคืบหน้าการเลื่อน
  useEffect(() => {
    const ids = ['about', 'members', 'contact', 'chat'];
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
      const line = window.innerHeight * 0.35;
      let cur = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      setActive(cur);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [data]);

  useEffect(() => {
    if (data) document.title = `${data.group.name} | Portfolio`;
  }, [data]);

  return (
    <>
      <nav className="nav">
        <a href="#top" className="brand">{data?.group.name || 'Portfolio'}</a>
        <div className="nav-links">
          {[['about', 'เกี่ยวกับ'], ['members', 'สมาชิก'], ['contact', 'ติดต่อ']].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'true' : undefined}>{label}</a>
          ))}
          <a href="#chat" className={`nav-cta ${active === 'chat' ? 'active' : ''}`}>คุยกับ AI</a>
          <button className="icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="สลับโหมดสี">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <span className="nav-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </nav>
      <main id="top">
        {error && <p className="error container">โหลดข้อมูลไม่สำเร็จ: {error}</p>}
        {!data && !error && <p className="container muted">กำลังโหลด...</p>}
        {data && <Portfolio data={data} />}
        <Chat members={data?.members || []} />
      </main>
      <footer className="footer">© {new Date().getFullYear()} {data?.group.name} · AIE312</footer>
    </>
  );
}
