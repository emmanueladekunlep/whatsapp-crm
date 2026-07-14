import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    if (req.method === 'GET') {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch quotes' });
      }

      return res.status(200).json(quotes);
    }

    if (req.method === 'POST') {
      const { customerId, amount, description, status } = req.body;

      if (!customerId || !amount) {
        return res.status(400).json({ error: 'Customer and amount required' });
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert([{ 
          user_id: userId, 
          customer_id: customerId, 
          amount, 
          description: description || '', 
          status: status || 'pending' 
        }])
        .select();

      if (error) {
        return res.status(500).json({ error: 'Failed to add quote' });
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Quote added',
        id: data[0].id 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}