import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { Client, LocalAuth } from 'whatsapp-web.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store clients globally to reuse
declare global {
  var whatsappClients: Map<number, any>;
}
if (!global.whatsappClients) {
  global.whatsappClients = new Map();
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

    // Check if already connected
    const { data: existing } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_connected', true);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'WhatsApp already connected' });
    }

    // Create WhatsApp client
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: `./whatsapp-session-${userId}`
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Store client
    global.whatsappClients.set(userId, client);

    // Generate QR
    let qrCode = '';
    client.on('qr', (qr) => {
      qrCode = qr;
    });

    client.on('ready', async () => {
      const phoneNumber = client.info?.wid?.user || '';
      
      // Save session to database
      await supabase
        .from('whatsapp_sessions')
        .insert([{
          user_id: userId,
          session_data: 'active',
          is_connected: true,
          phone_number: phoneNumber
        }]);

      console.log(`WhatsApp connected for user ${userId}`);
    });

    client.on('disconnected', async () => {
      await supabase
        .from('whatsapp_sessions')
        .update({ is_connected: false })
        .eq('user_id', userId);
    });

    await client.initialize();

    // Return QR code
    res.status(200).json({ 
      qrCode,
      message: 'Scan QR code with WhatsApp mobile app'
    });

  } catch (error) {
    console.error('WhatsApp connect error:', error);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
}