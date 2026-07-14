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
    const { phoneNumber, message, customerId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message required' });
    }

    // Format phone number for WhatsApp
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const whatsappNumber = `${formattedNumber}@c.us`;

    // Get WhatsApp client
    const client = global.whatsappClients?.get(userId);
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    // Send message
    await client.sendMessage(whatsappNumber, message);

    // Log message
    await supabase
      .from('message_logs')
      .insert([{
        user_id: userId,
        customer_id: customerId || null,
        phone_number: phoneNumber,
        message: message,
        direction: 'outgoing'
      }]);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}