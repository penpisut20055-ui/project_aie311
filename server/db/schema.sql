-- ตารางข้อมูลกลุ่ม (มีแถวเดียว)
CREATE TABLE IF NOT EXISTS group_info (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  concept     TEXT,
  description TEXT,
  contact     JSONB DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ผลงานร่วมของกลุ่ม
CREATE TABLE IF NOT EXISTS group_works (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  tech        TEXT[] DEFAULT '{}',
  link        TEXT
);

-- สมาชิก
CREATE TABLE IF NOT EXISTS members (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  nickname    TEXT,
  student_id  TEXT,
  role        TEXT,
  bio         TEXT,
  skills      TEXT[] DEFAULT '{}',
  image       TEXT,
  sort_order  INT DEFAULT 0
);

-- ผลงานของสมาชิกแต่ละคน
CREATE TABLE IF NOT EXISTS member_projects (
  id          SERIAL PRIMARY KEY,
  member_id   INT REFERENCES members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  link        TEXT
);

-- ประวัติแชท
CREATE TABLE IF NOT EXISTS chat_messages (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id, created_at);
