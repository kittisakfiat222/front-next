// pages/api/proxy.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.BACKEND_URL + req.url;  // ตั้งค่า URL ของ Backend

  try {
    // ส่งคำขอไปยัง Backend API
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // เพิ่ม Authorization header ถ้าจำเป็น
        // 'Authorization': `Bearer ${yourToken}`,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);  // ส่งข้อมูลที่ตอบกลับจาก Backend
  } catch (error) {
    console.error('Error fetching from backend:', error);
    res.status(500).json({ error: 'Error contacting backend' });
  }
}
