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
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }

      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      const { name, phone, email, notes } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Customer name is required' });
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{ 
          user_id: userId, 
          name: name.trim(), 
          phone: phone || '', 
          email: email || '', 
          notes: notes || '' 
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to add customer: ' + error.message });
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Customer added successfully',
        id: data[0].id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(401).json({ error: 'Invalid token or server error' });
  }
}