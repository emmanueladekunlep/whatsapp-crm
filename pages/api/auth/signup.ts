import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import bcrypt from 'bcryptjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, business_name, phone } = req.body;

  if (!email || !password || !business_name) {
    return res.status(400).json({ error: 'Email, password, and business name required' });
  }

  // Check if user already exists
  const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const existing = checkStmt.get(email);

  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user (inactive by default)
  const stmt = db.prepare(`
    INSERT INTO users (email, password, business_name, phone, is_active)
    VALUES (?, ?, ?, ?, 0)
  `);

  const result = stmt.run(email, hashedPassword, business_name, phone || '');

  res.status(201).json({
    success: true,
    message: 'Account created. Contact admin to activate.',
    userId: result.lastInsertRowid
  });
}