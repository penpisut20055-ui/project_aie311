import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ตอนพัฒนาในเครื่อง ส่ง /api ไปที่ backend พอร์ต 3001
  server: { proxy: { '/api': 'http://localhost:3001' } },
});
