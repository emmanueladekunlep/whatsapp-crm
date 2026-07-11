import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stmt = db.prepare(`
    SELECT id, email, business_name, phone, is_active, created_at, expiry_date 
    FROM users 
    ORDER BY created_at DESC
  `);

  const users = stmt.all();
  res.status(200).json(users);
}