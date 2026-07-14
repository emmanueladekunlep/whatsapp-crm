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

    // GET - Fetch all auto-reply rules
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('auto_reply_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch rules' });
      }

      return res.status(200).json(data);
    }

    // POST - Create new auto-reply rule
    if (req.method === 'POST') {
      const { trigger_keyword, reply_message, match_type } = req.body;

      if (!trigger_keyword || !reply_message) {
        return res.status(400).json({ error: 'Keyword and reply message required' });
      }

      const { data, error } = await supabase
        .from('auto_reply_rules')
        .insert([{
          user_id: userId,
          trigger_keyword,
          reply_message,
          match_type: match_type || 'contains',
          is_active: true
        }])
        .select();

      if (error) {
        return res.status(500).json({ error: 'Failed to create rule' });
      }

      return res.status(201).json({
        success: true,
        message: 'Auto-reply rule created',
        rule: data[0]
      });
    }

    // PUT - Update auto-reply rule
    if (req.method === 'PUT') {
      const { id, trigger_keyword, reply_message, match_type, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Rule ID required' });
      }

      const updates: any = {};
      if (trigger_keyword) updates.trigger_keyword = trigger_keyword;
      if (reply_message) updates.reply_message = reply_message;
      if (match_type) updates.match_type = match_type;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from('auto_reply_rules')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({ error: 'Failed to update rule' });
      }

      return res.status(200).json({
        success: true,
        message: 'Rule updated successfully'
      });
    }

    // DELETE - Delete auto-reply rule
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Rule ID required' });
      }

      const { error } = await supabase
        .from('auto_reply_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete rule' });
      }

      return res.status(200).json({
        success: true,
        message: 'Rule deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Auto-reply error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
