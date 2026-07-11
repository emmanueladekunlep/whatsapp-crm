import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-change-this-in-production';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify token
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    if (req.method === 'GET') {
      // Get all customers for this user
      const stmt = db.prepare('SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC');
      const customers = stmt.all(userId);
      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      // Add new customer
      const { name, phone, email, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Customer name is required' });
      }

      const stmt = db.prepare(`
        INSERT INTO customers (user_id, name, phone, email, notes)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(userId, name, phone || '', email || '', notes || '');
      
      return res.status(201).json({ 
        success: true, 
        message: 'Customer added successfully',
        id: result.lastInsertRowid
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}