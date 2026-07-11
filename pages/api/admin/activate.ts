import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, months } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  let expiryDate = null;
  if (months && months > 0) {
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
  }

  const stmt = db.prepare(`
    UPDATE users 
    SET is_active = ?,
        expiry_date = ?,
        activated_by = 'admin'
    WHERE id = ?
  `);

  const isActive = months && months > 0 ? 1 : 0;
  const result = stmt.run(isActive, expiryDate?.toISOString() || null, userId);

  if (result.changes > 0) {
    res.status(200).json({ 
      success: true, 
      message: isActive ? 'User activated successfully' : 'User deactivated successfully',
      expiryDate: expiryDate?.toISOString() || null
    });
  } else {
    res.status(400).json({ error: 'User not found' });
  }
}