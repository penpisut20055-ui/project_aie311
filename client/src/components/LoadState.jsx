// หน้าตอนกำลังโหลด (โครงการ์ดแบบ skeleton) และหน้าแจ้งเตือนตอนเชื่อมต่อ backend ไม่ได้

export function PortfolioSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-live="polite">
      <span className="sr-only">กำลังโหลดข้อมูล...</span>
      <header className="hero">
        <div className="container sk-hero" aria-hidden="true">
          <div className="sk sk-line" style={{ width: 180 }} />
          <div className="sk sk-title" />
          <div className="sk sk-line" style={{ width: 260 }} />
          <div className="sk-row">
            <div className="sk sk-btn" />
            <div className="sk sk-btn" style={{ width: 170 }} />
          </div>
        </div>
      </header>
      <section className="section container" aria-hidden="true">
        <div className="sk sk-heading" />
        <div className="grid members sk-cards">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card sk-card" style={{ '--i': i }}>
              <div className="sk sk-avatar" />
              <div className="sk sk-line" style={{ width: '70%' }} />
              <div className="sk sk-line" style={{ width: '45%' }} />
              <div className="sk-row sk-tags">
                <div className="sk sk-tag" /><div className="sk sk-tag" /><div className="sk sk-tag" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function LoadError({ detail, retrying, onRetry }) {
  return (
    <section className="load-error container" role="alert">
      <div className="load-error-card">
        <div className="load-error-icon" aria-hidden="true">🔌</div>
        <h2>ยังเชื่อมต่อข้อมูลไม่ได้</h2>
        <p className="muted">
          เซิร์ฟเวอร์อาจกำลังเริ่มทำงานหรือปิดอยู่ชั่วคราว
          ถ้าเพิ่งเปิดเว็บครั้งแรก อาจต้องรอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง
        </p>
        <button className="btn load-error-btn" onClick={onRetry} disabled={retrying}>
          {retrying ? <><span className="spinner" aria-hidden="true" /> กำลังลองใหม่...</> : '↻ ลองใหม่'}
        </button>
        {detail && (
          <details className="load-error-detail">
            <summary>รายละเอียดสำหรับผู้พัฒนา</summary>
            <code>{detail}</code>
          </details>
        )}
      </div>
    </section>
  );
}
