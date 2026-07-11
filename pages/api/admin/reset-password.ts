import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import bcrypt from 'bcryptjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const stmt = db.prepare(`
    UPDATE users 
    SET password = ?
    WHERE id = ?
  `);

  const result = stmt.run(hashedPassword, userId);

  if (result.changes > 0) {
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully'
    });
  } else {
    res.status(400).json({ error: 'User not found' });
  }
}