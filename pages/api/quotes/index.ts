import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
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
        SELECT q.*, c.name as customer_name 
        FROM quotes q
        JOIN customers c ON q.customer_id = c.id
        WHERE q.user_id = ?
        ORDER BY q.created_at DESC
      `);
      const quotes = stmt.all(userId);
      return res.status(200).json(quotes);
    }

    if (req.method === 'POST') {
      const { customerId, amount, description, status } = req.body;

      if (!customerId || !amount) {
        return res.status(400).json({ error: 'Customer and amount required' });
      }

      const stmt = db.prepare(`
        INSERT INTO quotes (user_id, customer_id, amount, description, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(userId, customerId, amount, description || '', status || 'pending');
      return res.status(201).json({ success: true, message: 'Quote added', id: result.lastInsertRowid });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}