import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

declare global {
  var whatsappClients: Map<number, any>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    // Get client
    const client = global.whatsappClients?.get(userId);
    if (client) {
      await client.destroy();
      global.whatsappClients.delete(userId);
    }

    // Update database
    await supabase
      .from('whatsapp_sessions')
      .update({ is_connected: false })
      .eq('user_id', userId);

    res.status(200).json({ 
      success: true, 
      message: 'WhatsApp disconnected' 
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
}