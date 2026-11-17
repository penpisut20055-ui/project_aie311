# Group Portfolio + AI Chat (AIE312)

เว็บไซต์ Portfolio ของกลุ่ม พร้อมแชทบอท AI (Google Gemini) ที่ตอบคำถามเกี่ยวกับกลุ่มและสมาชิกแต่ละคน โดยใช้ข้อมูลจากฐานข้อมูล

> 🔗 **ลิงก์เว็บที่ deploy แล้ว:** _(ใส่ลิงก์ Vercel ตรงนี้)_
> 🔗 **API:** _(ใส่ลิงก์ Render ตรงนี้)_

## ฟีเจอร์

- **หน้า Portfolio**: แนะนำกลุ่ม (ชื่อ, แนวคิด, ผลงานร่วม), สมาชิกแต่ละคน (ชื่อ, บทบาท, ทักษะ, ผลงาน), ช่องทางติดต่อ
- **Chat UI (React)**: แยกข้อความผู้ใช้ (ขวา, สีม่วง) กับ AI (ซ้าย, สีเทา) ชัดเจน มีปุ่มคำถามแนะนำ, แสดงสถานะกำลังพิมพ์, ล้างแชทได้
- **Backend (Express)**: API รับข้อความแล้วส่งต่อให้ Gemini
- **PostgreSQL**: เก็บข้อมูล portfolio และประวัติแชททุกข้อความ
- **AI ตอบจากข้อมูลกลุ่ม**: ทุกครั้งที่แชท ระบบดึงข้อมูลกลุ่ม/สมาชิกจาก DB มาใส่ใน system prompt ของ Gemini
- **CI/CD**: GitHub Actions ทดสอบ backend (กับ PostgreSQL จริง) + build frontend แล้ว deploy อัตโนมัติเมื่อ push เข้า `main`
- **ลูกเล่นเพิ่มเติม**: Dark mode, ประวัติแชทยังอยู่หลังรีเฟรชหน้า, รองรับมือถือ

## โครงสร้างโปรเจกต์

```
├── client/                 # Frontend: React + Vite
│   └── src/components/     # Portfolio.jsx, Chat.jsx
├── server/                 # Backend: Express
│   ├── data/portfolio.json # ⭐ ข้อมูลกลุ่ม/สมาชิก (แก้ที่นี่ไฟล์เดียว)
│   ├── db/schema.sql       # โครงสร้างตาราง
│   ├── db/setup.js         # สร้างตาราง + ใส่ข้อมูลจาก portfolio.json ลง DB
│   ├── src/                # app.js (API), gemini.js, prompt.js, ...
│   └── test/               # เทส API
├── .github/workflows/ci-cd.yml
└── render.yaml             # ค่าตั้งต้นสำหรับ deploy backend บน Render
```

## ✏️ แก้ข้อมูลกลุ่ม (ทำเมื่อกลุ่มตกลงข้อมูลจริงแล้ว)

1. เปิดไฟล์ `server/data/portfolio.json`
2. แก้ชื่อกลุ่ม, แนวคิด, ผลงานร่วม, ช่องทางติดต่อ และข้อมูลสมาชิกแต่ละคน (ถ้ากลุ่มมี 3 คน ลบก้อนสมาชิกคนที่ 4 ทิ้ง)
   - ใส่รูปสมาชิกได้ที่ช่อง `"image"` (ลิงก์รูป หรือวางไฟล์ใน `client/public/` แล้วใส่ `"/ชื่อไฟล์.jpg"`)
   - **วิดีโอเปิดตัวสมาชิก**: ตอนนี้เป็นการ์ตูนตัวอย่าง เปลี่ยนเป็นวิดีโอจริงได้โดยเอาไฟล์ MP4 ไปวางทับ `client/public/members.mp4` (แนวนอน 16:9 ยาว 5–10 วินาที ไม่เกิน ~20MB, ไม่มีเสียงก็ได้) ชื่อแต่ละคนจะขึ้นใต้ตำแหน่ง ซ้าย/กลาง/ขวา (ปรับได้ที่ `NAME_POSITIONS` ใน `client/src/components/MembersVideo.jsx`) ถ้าอยากสร้างการ์ตูนใหม่ รัน `python tools/make_cartoon_video.py`
3. รัน `npm run db:seed` ในโฟลเดอร์ `server/` เพื่ออัปเดตข้อมูลใน DB (หรือแค่ push ขึ้น GitHub ระบบ deploy จะอัปเดตให้เอง)

AI จะตอบตามข้อมูลใหม่ทันทีโดยไม่ต้องแก้โค้ด

## 🚀 วิธีติดตั้งและรันในเครื่อง

สิ่งที่ต้องมี: Node.js 20 ขึ้นไป, PostgreSQL (ในเครื่อง หรือใช้ฟรีบน [Neon](https://neon.tech))

### 1) Backend

```bash
cd server
npm install
cp .env.example .env      # แล้วแก้ค่า DATABASE_URL และ GEMINI_API_KEY ใน .env
npm run db:setup          # สร้างตาราง + ใส่ข้อมูลกลุ่ม
npm run dev               # รันที่ http://localhost:3001
```

- ขอ Gemini API key ฟรีได้ที่ https://aistudio.google.com/apikey
- ถ้ายังไม่ใส่ `DATABASE_URL` / `GEMINI_API_KEY` เซิร์ฟเวอร์ยังรันได้ในโหมดทดลอง (ข้อมูลอ่านจากไฟล์ JSON, AI ตอบแบบจำลอง)

### 2) Frontend (เปิดอีก terminal)

```bash
cd client
npm install
npm run dev               # เปิด http://localhost:5173
```

### รันเทส

```bash
cd server && npm test
```

## API

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | เช็กสถานะเซิร์ฟเวอร์ |
| GET | `/api/portfolio` | ข้อมูลกลุ่มและสมาชิก (จาก DB) |
| POST | `/api/chat` | ส่ง `{ sessionId, message }` ได้ `{ reply }` กลับมา |
| GET | `/api/chat/:sessionId` | ประวัติแชทของ session |
| DELETE | `/api/chat/:sessionId` | ล้างประวัติแชท |

## ฐานข้อมูล

| ตาราง | เก็บอะไร |
|---|---|
| `group_info` | ชื่อกลุ่ม, แนวคิด, คำอธิบาย, ช่องทางติดต่อ |
| `group_works` | ผลงานร่วมของกลุ่ม |
| `members` | สมาชิก (ชื่อ, บทบาท, ทักษะ, ...) |
| `member_projects` | ผลงานของสมาชิกแต่ละคน |
| `chat_messages` | ประวัติแชท (session, ผู้พูด, ข้อความ, เวลา) |

## ☁️ วิธี Deploy (ทำครั้งเดียว)

### 1) ฐานข้อมูล: Neon (ฟรี)
1. สมัคร https://neon.tech → Create project
2. คัดลอก **Connection string** (ขึ้นต้นด้วย `postgresql://...?sslmode=require`) เก็บไว้

### 2) Backend: Render (ฟรี)
1. สมัคร https://render.com ด้วยบัญชี GitHub
2. **New → Blueprint** → เลือก repo นี้ (Render จะอ่าน `render.yaml` ให้)
3. ใส่ Environment Variables: `DATABASE_URL` (จาก Neon), `GEMINI_API_KEY`, `CORS_ORIGIN` (ใส่ลิงก์ Vercel หลังทำข้อ 3 เสร็จ เช่น `https://xxx.vercel.app`)
4. กด Deploy → ได้ลิงก์ API เช่น `https://aie312-api.onrender.com`
5. ไปที่ Settings → **Deploy Hook** → คัดลอก URL เก็บไว้ (ใช้ในข้อ 4)

### 3) Frontend: Vercel (ฟรี)
1. สมัคร https://vercel.com ด้วยบัญชี GitHub → **Add New Project** → เลือก repo นี้
2. ตั้ง **Root Directory = `client`** (Framework: Vite)
3. Environment Variable: `VITE_API_URL` = ลิงก์ API จาก Render
4. Deploy → ได้ลิงก์เว็บ แล้วกลับไปใส่ใน `CORS_ORIGIN` ของ Render

### 4) ตั้ง CI/CD ให้ deploy อัตโนมัติ
ไปที่ GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** แล้วเพิ่ม:

| Secret | หาได้จาก |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render → Settings → Deploy Hook |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` และ `VERCEL_PROJECT_ID` | Vercel → Project Settings → General (หรือรัน `npx vercel link` ใน repo แล้วดูไฟล์ `.vercel/project.json`) |

ใน Vercel → Project Settings → Git ให้ปิด auto-deploy (Ignored Build Step: `exit 0`) เพื่อให้ GitHub Actions เป็นคน deploy หลังเทสผ่านเท่านั้น

หลังจากนี้ทุกครั้งที่ push เข้า `main`: เทส backend + build frontend → ถ้าผ่าน จะ deploy ทั้ง Render และ Vercel อัตโนมัติ (ดูผลได้ที่แท็บ **Actions**)

## เทคโนโลยี

React 18, Vite, Express 4, PostgreSQL, Google Gemini (`@google/genai`), GitHub Actions, Vercel, Render, Neon

## สมาชิก

_(ใส่ชื่อ-รหัสนักศึกษาและหน้าที่ของแต่ละคน)_
