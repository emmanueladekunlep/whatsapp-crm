 import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    // Get message counts
    const { data: allMessages } = await supabase
      .from('message_logs')
      .select('direction, created_at')
      .eq('user_id', userId);

    // Get customer count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get quote count
    const { count: totalQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get reminder count
    const { count: totalReminders } = await supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_done', 0);

    // Calculate message stats
    const totalMessages = allMessages?.length || 0;
    const incomingMessages = allMessages?.filter(m => m.direction === 'incoming').length || 0;
    const outgoingMessages = allMessages?.filter(m => m.direction === 'outgoing').length || 0;

    // Get last 7 days activity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = allMessages?.filter(m => 
        m.created_at.startsWith(dateStr)
      ).length || 0;
      
      last7Days.push({
        date: dateStr,
        messages: count
      });
    }

    res.status(200).json({
      summary: {
        totalCustomers: totalCustomers || 0,
        totalMessages,
        incomingMessages,
        outgoingMessages,
        totalQuotes: totalQuotes || 0,
        pendingReminders: totalReminders || 0
      },
      last7Days,
      recentMessages: allMessages?.slice(0, 10) || []
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
