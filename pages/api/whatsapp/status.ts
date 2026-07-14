 import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

declare global {
  var whatsappClients: Map<number, any>;
}

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

    // Check database for session
    const { data: sessions } = await supabase
      .from('whatsapp_sessions')
      .select('is_connected, phone_number')
      .eq('user_id', userId)
      .eq('is_connected', true);

    const connected = sessions && sessions.length > 0;

    res.status(200).json({
      connected: connected,
      phoneNumber: connected ? sessions[0].phone_number : null
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
