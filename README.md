# MANIFEST CHAT AI — Group Portfolio & AI Assistant

เว็บแอปพลิเคชันแสดง Portfolio ของกลุ่ม **MANIFEST** (แนวคิด: "ฝันให้ไกล ไปให้พ้น") พร้อมระบบแชต AI (Google Gemini) ที่ตอบคำถามเกี่ยวกับผลงานและทักษะของสมาชิกในกลุ่มจากฐานข้อมูลจริง

> 🔗 **ลิงก์เว็บที่ deploy แล้ว:** _(ใส่ลิงก์ Vercel ตรงนี้)_
> 🔗 **API:** _(ใส่ลิงก์ Render ตรงนี้)_

## สมาชิกในกลุ่ม MANIFEST
1. **เตชิน เดชจิตร** — Frontend & UI/UX
2. **จารุยา จรุงพร** — Backend & Database
3. **เพ็ญพิศุทธิ์ วชิระอารีรัตน์** — AI Integration & CI/CD

## ฟีเจอร์

- **หน้า Portfolio**: แนะนำกลุ่ม (ชื่อ, แนวคิด, ผลงานร่วม), วิดีโอเปิดตัวสมาชิก, การ์ดสมาชิกแต่ละคน (บทบาท, ทักษะ, ผลงาน), ช่องทางติดต่อ
- **Chat UI (React)**: แยกข้อความผู้ใช้กับ AI ชัดเจน มีปุ่มคำถามแนะนำ, สถานะกำลังพิมพ์, ล้างแชทได้
- **Backend (Express)**: API รับข้อความแล้วส่งต่อให้ Gemini
- **PostgreSQL**: เก็บข้อมูล portfolio และประวัติแชททุกข้อความ
- **AI ตอบจากข้อมูลกลุ่ม**: ทุกครั้งที่แชท ระบบดึงข้อมูลกลุ่ม/สมาชิกจาก DB มาใส่ใน system prompt ของ Gemini
- **CI/CD**: GitHub Actions เช็ก backend (กับ PostgreSQL จริง) + build frontend แล้ว deploy อัตโนมัติเมื่อ push เข้า `main`
- **ลูกเล่น**: อนิเมชั่น, เลื่อนนุ่มตอนกดเมนู, Dark mode, รองรับมือถือ

## Tech Stack
- **Frontend:** React (Vite) — โฟลเดอร์ `client/`
- **Backend:** Node.js, Express — โฟลเดอร์ `backend/`
- **Database:** PostgreSQL
- **AI Integration:** Google Gemini API (`@google/genai`, `gemini-3.5-flash-lite`)

## โครงสร้างโปรเจกต์

```
├── client/                     # Frontend: React + Vite
│   ├── public/members.mp4      # วิดีโอเปิดตัวสมาชิก (ตอนนี้เป็นการ์ตูนตัวอย่าง)
│   └── src/
│       ├── api.js              # เรียก API ของ backend + แปลงรูปแบบข้อมูลให้หน้าเว็บ
│       └── components/         # Portfolio.jsx, MembersVideo.jsx, Chat.jsx
├── backend/                    # Backend: Express + PostgreSQL + Gemini
│   └── server.js               # API, สร้างตาราง และข้อมูลกลุ่ม/สมาชิก
├── tools/make_cartoon_video.py # สคริปต์สร้างวิดีโอการ์ตูนตัวอย่าง
├── .github/workflows/ci-cd.yml
└── render.yaml                 # ค่าตั้งต้นสำหรับ deploy backend บน Render
```

## 🚀 วิธีติดตั้งและรันในเครื่อง

สิ่งที่ต้องมี: Node.js 20 ขึ้นไป, PostgreSQL (ในเครื่อง หรือใช้ฟรีบน [Neon](https://neon.tech)), Gemini API key (ขอฟรีที่ https://aistudio.google.com/apikey)

### 1) Backend

1. เข้าไปที่โฟลเดอร์ `backend` และติดตั้งแพ็กเกจ:
   ```bash
   cd backend
   npm install
   ```
2. คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วใส่ค่า `DATABASE_URL` และ `GEMINI_API_KEY` (ห้าม commit ไฟล์ `.env`)
3. รันเซิร์ฟเวอร์ (สร้างตารางและใส่ข้อมูลกลุ่มให้อัตโนมัติ):
   ```bash
   npm run dev               # รันที่ http://localhost:5000
   ```

### 2) Frontend (เปิดอีก terminal)

```bash
cd client
npm install
npm run dev               # เปิด http://localhost:5173 (ส่ง /api ไปที่ localhost:5000 ให้อัตโนมัติ)
```

## ✏️ แก้ข้อมูลกลุ่ม / สมาชิก

- ข้อมูลกลุ่มและสมาชิกอยู่ใน `backend/server.js` (ฟังก์ชัน `initDatabase`) แก้แล้วรีสตาร์ต backend ข้อมูลใน DB จะอัปเดตเอง
- **วิดีโอเปิดตัวสมาชิก**: วางไฟล์ MP4 ทับ `client/public/members.mp4` (แนวนอน 16:9 ยาว 5–10 วินาที ไม่เกิน ~20MB) ชื่อจะขึ้นใต้ตำแหน่ง ซ้าย/กลาง/ขวา ตามลำดับสมาชิกใน `server.js` (ปรับตำแหน่งได้ที่ `NAME_POSITIONS` ใน `client/src/components/MembersVideo.jsx`) ถ้าอยากสร้างการ์ตูนใหม่ รัน `python tools/make_cartoon_video.py`

## API

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | เช็กสถานะเซิร์ฟเวอร์ |
| GET | `/api/portfolio` | ข้อมูลกลุ่มและสมาชิก (จาก DB) |
| GET | `/api/chat?sessionId=<id>` | ประวัติแชทของ session นั้น |
| POST | `/api/chat` | ส่ง `{ sessionId, message }` ได้ `{ reply }` กลับมา |
| DELETE | `/api/chat?sessionId=<id>` | ล้างประวัติแชทของ session นั้น |

## ฐานข้อมูล

| ตาราง | เก็บอะไร |
|---|---|
| `portfolio_group` | ชื่อกลุ่ม, แนวคิด, จุดเด่น, ผลงานร่วม, ช่องทางติดต่อ |
| `portfolio_members` | สมาชิก (ชื่อ, บทบาท, ทักษะ, ผลงาน) |
| `chat_messages` | ประวัติแชทแยกตาม `session_id` (ผู้พูด, ข้อความ, เวลา) |

## ☁️ วิธี Deploy (ทำครั้งเดียว)

### 1) ฐานข้อมูล: Neon (ฟรี)
1. สมัคร https://neon.tech → Create project
2. คัดลอก **Connection string** (ขึ้นต้นด้วย `postgresql://...?sslmode=require`) เก็บไว้

### 2) Backend: Render (ฟรี)
1. สมัคร https://render.com ด้วยบัญชี GitHub
2. **New → Blueprint** → เลือก repo นี้ (Render จะอ่าน `render.yaml` ให้)
3. ใส่ Environment Variables: `DATABASE_URL` (จาก Neon), `GEMINI_API_KEY`, `FRONTEND_URL` (ใส่ลิงก์ Vercel หลังทำข้อ 3 เสร็จ เช่น `https://xxx.vercel.app`)
4. กด Deploy → ได้ลิงก์ API เช่น `https://manifest-api.onrender.com`
5. ไปที่ Settings → **Deploy Hook** → คัดลอก URL เก็บไว้ (ใช้ในข้อ 4)

### 3) Frontend: Vercel (ฟรี)
1. สมัคร https://vercel.com ด้วยบัญชี GitHub → **Add New Project** → เลือก repo นี้
2. ตั้ง **Root Directory = `client`** (Framework: Vite)
3. Environment Variable: `VITE_API_URL` = ลิงก์ API จาก Render
4. Deploy → ได้ลิงก์เว็บ แล้วกลับไปใส่ใน `FRONTEND_URL` ของ Render

### 4) ตั้ง CI/CD ให้ deploy อัตโนมัติ
ไปที่ GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** แล้วเพิ่ม:

| Secret | หาได้จาก |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render → Settings → Deploy Hook |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` และ `VERCEL_PROJECT_ID` | Vercel → Project Settings → General (หรือรัน `npx vercel link` ใน repo แล้วดูไฟล์ `.vercel/project.json`) |

ใน Vercel → Project Settings → Git ให้ปิด auto-deploy (Ignored Build Step: `exit 0`) เพื่อให้ GitHub Actions เป็นคน deploy หลังเช็กผ่านเท่านั้น

หลังจากนี้ทุกครั้งที่ push เข้า `main`: เช็กว่า backend เปิดได้กับ PostgreSQL จริง + build frontend → ถ้าผ่าน จะ deploy ทั้ง Render และ Vercel อัตโนมัติ (ดูผลได้ที่แท็บ **Actions**)
