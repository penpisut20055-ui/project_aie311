import { useEffect, useState } from 'react';
import { getPortfolio } from './api.js';
import Portfolio from './components/Portfolio.jsx';
import Chat from './components/Chat.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    getPortfolio().then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (data) document.title = `${data.group.name} | Portfolio`;
  }, [data]);

  return (
    <>
      <nav className="nav">
        <a href="#top" className="brand">{data?.group.name || 'Portfolio'}</a>
        <div className="nav-links">
          <a href="#about">เกี่ยวกับ</a>
          <a href="#members">สมาชิก</a>
          <a href="#contact">ติดต่อ</a>
          <a href="#chat" className="nav-cta">คุยกับ AI</a>
          <button className="icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="สลับโหมดสี">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
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
