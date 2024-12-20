import { NextApiRequest, NextApiResponse } from 'next';

const NEXT_PUBLIC_API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/register`; // URL ของ API backend

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // ส่งข้อมูลที่ได้จาก frontend ไปยัง API backend
    const response = await fetch(NEXT_PUBLIC_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body), // ส่งข้อมูลจาก frontend ไป
    });

    const data = await response.json();

    if (response.ok) {
      // หาก backend ตอบกลับ OK ให้ส่งข้อมูลกลับไปยัง frontend
      return res.status(201).json(data);
    } else {
      // หาก backend ตอบกลับไม่สำเร็จ ส่งข้อความผิดพลาดกลับไป
      return res.status(400).json({ message: data.message || 'Registration failed' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
