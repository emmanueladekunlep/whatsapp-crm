import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-change-this-in-production';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    if (req.method === 'GET') {
      const stmt = db.prepare(`
        SELECT r.*, c.name as customer_name 
        FROM reminders r
        JOIN customers c ON r.customer_id = c.id
        WHERE r.user_id = ?
        ORDER BY r.due_date ASC
      `);
      const reminders = stmt.all(userId);
      return res.status(200).json(reminders);
    }

    if (req.method === 'POST') {
      const { customerId, title, description, due_date } = req.body;

      if (!customerId || !title || !due_date) {
        return res.status(400).json({ error: 'Customer, title, and due date required' });
      }

      const stmt = db.prepare(`
        INSERT INTO reminders (user_id, customer_id, title, description, due_date)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(userId, customerId, title, description || '', due_date);
      return res.status(201).json({ success: true, message: 'Reminder added', id: result.lastInsertRowid });
    }

    if (req.method === 'PUT') {
      const { id, is_done } = req.body;

      const stmt = db.prepare(`
        UPDATE reminders SET is_done = ? WHERE id = ? AND user_id = ?
      `);

      const result = stmt.run(is_done, id, userId);
      return res.status(200).json({ success: true, message: 'Reminder updated' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}