import { useEffect, useRef, useState } from 'react';
import { clearHistory, getHistory, sendMessage } from '../api.js';

function getSessionId() {
  let id = localStorage.getItem('chatSessionId');
  if (!id) {
    id = crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem('chatSessionId', id);
  }
  return id;
}

export default function Chat({ members }) {
  const [sessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    getHistory(sessionId).then(setMessages).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const suggestions = [
    'กลุ่มนี้มีแนวคิดอะไร?',
    'สมาชิกมีใครบ้าง แต่ละคนทำหน้าที่อะไร?',
    ...members.slice(0, 2).map((m) => `${m.nickname || m.name} มีทักษะอะไรบ้าง?`),
  ];

  async function send(text) {
    const message = text.trim();
    if (!message || loading) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const { reply } = await sendMessage(sessionId, message);
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    await clearHistory(sessionId).catch(() => {});
    setMessages([]);
  }

  return (
    <section id="chat" className="section container">
      <div className="chat-head">
        <h2 className="reveal">คุยกับ AI ของกลุ่ม</h2>
        {messages.length > 0 && <button className="btn btn-ghost btn-sm" onClick={reset}>ล้างแชท</button>}
      </div>
      <div className="chat reveal">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>👋 สวัสดีครับ ถามอะไรเกี่ยวกับกลุ่มหรือสมาชิกก็ได้</p>
              <div className="chips">
                {suggestions.map((s, i) => <button key={s} className="chip" style={{ '--i': i }} onClick={() => send(s)}>{s}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
              <span className="msg-who">{m.role === 'user' ? 'คุณ' : '🤖 AI'}</span>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-ai">
              <span className="msg-who">🤖 AI</span>
              <div className="bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {error && <p className="error chat-error">ส่งไม่สำเร็จ: {error}</p>}
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถาม..."
            maxLength={2000}
            aria-label="ข้อความ"
          />
          <button className="btn" disabled={loading || !input.trim()}>ส่ง</button>
        </form>
      </div>
    </section>
  );
}
