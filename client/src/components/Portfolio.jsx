import { useCallback, useState } from 'react';
import MembersVideo from './MembersVideo.jsx';
import MemberModal from './MemberModal.jsx';

// ตัวอักษรย่อบนรูปโปรไฟล์: ข้ามสระหน้า (เ แ โ ใ ไ) ของชื่อไทย และใช้ตัวเดียวสำหรับชื่อไทย
const initials = (name) => {
  const words = name.trim().split(/\s+/).map((w) => w.replace(/^[เแโใไ]+/, ''));
  if (/[฀-๿]/.test(name)) return words[0][0] || '';
  return words.map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

const Avatar = ({ m, big }) => (m.image
  ? <img src={m.image} alt={m.name} className={`avatar ${big ? 'avatar-lg' : ''}`} />
  : <div className={`avatar ${big ? 'avatar-lg' : ''}`} aria-hidden="true">{initials(m.nickname || m.name)}</div>);

export default function Portfolio({ data }) {
  const { group, members } = data;
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);
  const contact = group.contact || {};
  const contactItems = [
    contact.email && { label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    contact.github && { label: 'GitHub', value: contact.github, href: contact.github },
    contact.facebook && { label: 'Facebook', value: contact.facebook, href: contact.facebook },
    contact.line && { label: 'LINE', value: contact.line },
  ].filter(Boolean);

  return (
    <>
      <header className="hero">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
        <div className="container">
          <p className="eyebrow hero-in" style={{ '--d': 0 }}>AIE312 · Group Portfolio</p>
          <h1 className="hero-in" style={{ '--d': 1 }}>{group.name}</h1>
          <p className="lead hero-in" style={{ '--d': 2 }}>{group.concept}</p>
          <div className="hero-actions hero-in" style={{ '--d': 3 }}>
            <a href="#members" className="btn">ดูสมาชิก</a>
            <a href="#chat" className="btn btn-ghost">ถาม AI เกี่ยวกับเรา</a>
          </div>
        </div>
      </header>

      <section id="about" className="section container">
        <h2 className="reveal">เกี่ยวกับกลุ่ม</h2>
        <p className="reveal">{group.description}</p>
        <h3 className="reveal">ผลงานร่วมของกลุ่ม</h3>
        <div className="grid">
          {group.works?.map((w, i) => (
            <article key={w.title} className="card reveal" style={{ '--i': i }}>
              <h4>{w.title}</h4>
              <p className="muted">{w.description}</p>
              <div className="tags">{w.tech?.map((t) => <span key={t} className="tag">{t}</span>)}</div>
              {w.link && <a href={w.link} target="_blank" rel="noreferrer">ดูผลงาน →</a>}
            </article>
          ))}
        </div>
      </section>

      <section id="members" className="section container">
        <h2 className="reveal">สมาชิก</h2>
        <MembersVideo members={members} onDone={finishIntro} />
        <div className={`grid members ${introDone ? '' : 'waiting'}`}>
          {members.map((m, i) => (
            <article
              key={m.name}
              className="card member reveal"
              style={{ '--i': i }}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={`ดูข้อมูลเพิ่มเติมของ ${m.name}`}
              onClick={() => setSelected(m)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(m); } }}
            >
              <Avatar m={m} />
              <h3>{m.name}{m.nickname && <span className="muted"> ({m.nickname})</span>}</h3>
              <p className="role">{m.role}</p>
              {m.bio && <p className="muted member-bio">{m.bio}</p>}
              <div className="tags">{m.skills?.map((s) => <span key={s} className="tag">{s}</span>)}</div>
              <span className="member-more">คลิกดูเพิ่มเติม →</span>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section container">
        <h2 className="reveal">ติดต่อเรา</h2>
        <div className="contact">
          {contactItems.map((c, i) => (
            <div key={c.label} className="card contact-item reveal" style={{ '--i': i }}>
              <span className="muted">{c.label}</span>
              {c.href ? <a href={c.href} target="_blank" rel="noreferrer">{c.value}</a> : <span>{c.value}</span>}
            </div>
          ))}
        </div>
      </section>

      <MemberModal member={selected} avatar={selected && <Avatar m={selected} big />} onClose={closeModal} />
    </>
  );
}
