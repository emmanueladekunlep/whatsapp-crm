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
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch reminders' });
      }

      return res.status(200).json(reminders);
    }

    if (req.method === 'POST') {
      const { customerId, title, description, due_date } = req.body;

      if (!customerId || !title || !due_date) {
        return res.status(400).json({ error: 'Customer, title, and due date required' });
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert([{ 
          user_id: userId, 
          customer_id: customerId, 
          title, 
          description: description || '', 
          due_date 
        }])
        .select();

      if (error) {
        return res.status(500).json({ error: 'Failed to add reminder' });
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Reminder added',
        id: data[0].id 
      });
    }

    if (req.method === 'PUT') {
      const { id, is_done } = req.body;

      const { error } = await supabase
        .from('reminders')
        .update({ is_done })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({ error: 'Failed to update reminder' });
      }

      return res.status(200).json({ success: true, message: 'Reminder updated' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}