import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * ส่งข้อความไป Gemini
 * @param {string} systemPrompt
 * @param {{role:'user'|'model', content:string}[]} history  ข้อความก่อนหน้า (รวมข้อความล่าสุดของผู้ใช้)
 */
export async function askGemini(systemPrompt, history) {
  if (!ai) {
    // โหมดทดลองเมื่อยังไม่มี API key
    return '(โหมดทดลอง: ยังไม่ได้ตั้งค่า GEMINI_API_KEY) ได้รับข้อความ: ' + history.at(-1).content;
  }
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    config: { systemInstruction: systemPrompt, temperature: 0.7 },
  });
  return response.text?.trim() || 'ขออภัย ตอนนี้ตอบไม่ได้ ลองถามใหม่อีกครั้งนะครับ';
}
