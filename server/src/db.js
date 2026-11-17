import pg from 'pg';

const { Pool } = pg;

// ถ้าไม่ได้ตั้ง DATABASE_URL จะใช้โหมดหน่วยความจำ (ไว้ทดลองในเครื่องเท่านั้น)
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

export const hasDb = () => pool !== null;
