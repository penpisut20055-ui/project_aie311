const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('');

export default function Portfolio({ data }) {
  const { group, members } = data;
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
        <div className="container">
          <p className="eyebrow">AIE312 · Group Portfolio</p>
          <h1>{group.name}</h1>
          <p className="lead">{group.concept}</p>
          <div className="hero-actions">
            <a href="#members" className="btn">ดูสมาชิก</a>
            <a href="#chat" className="btn btn-ghost">ถาม AI เกี่ยวกับเรา</a>
          </div>
        </div>
      </header>

      <section id="about" className="section container">
        <h2>เกี่ยวกับกลุ่ม</h2>
        <p>{group.description}</p>
        <h3>ผลงานร่วมของกลุ่ม</h3>
        <div className="grid">
          {group.works?.map((w) => (
            <article key={w.title} className="card">
              <h4>{w.title}</h4>
              <p className="muted">{w.description}</p>
              <div className="tags">{w.tech?.map((t) => <span key={t} className="tag">{t}</span>)}</div>
              {w.link && <a href={w.link} target="_blank" rel="noreferrer">ดูผลงาน →</a>}
            </article>
          ))}
        </div>
      </section>

      <section id="members" className="section container">
        <h2>สมาชิก</h2>
        <div className="grid members">
          {members.map((m) => (
            <article key={m.name} className="card member">
              {m.image ? <img src={m.image} alt={m.name} className="avatar" /> : <div className="avatar">{initials(m.nickname || m.name)}</div>}
              <h3>{m.name}{m.nickname && <span className="muted"> ({m.nickname})</span>}</h3>
              <p className="role">{m.role}</p>
              <p className="muted">{m.bio}</p>
              <div className="tags">{m.skills?.map((s) => <span key={s} className="tag">{s}</span>)}</div>
              {m.projects?.length > 0 && (
                <ul className="projects">
                  {m.projects.map((p) => (
                    <li key={p.title}>
                      {p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.title}</a> : <strong>{p.title}</strong>}
                      {p.description && <span className="muted"> — {p.description}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section container">
        <h2>ติดต่อเรา</h2>
        <div className="contact">
          {contactItems.map((c) => (
            <div key={c.label} className="card contact-item">
              <span className="muted">{c.label}</span>
              {c.href ? <a href={c.href} target="_blank" rel="noreferrer">{c.value}</a> : <span>{c.value}</span>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
