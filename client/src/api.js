const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getPortfolio = () => request('/portfolio');
export const getHistory = (sessionId) => request(`/chat/${encodeURIComponent(sessionId)}`);
export const clearHistory = (sessionId) => request(`/chat/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
export const sendMessage = (sessionId, message) =>
  request('/chat', { method: 'POST', body: JSON.stringify({ sessionId, message }) });
