 import type { NextApiRequest, NextApiResponse } from 'next';
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

    const client = global.whatsappClients?.get(userId);
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    // QR will be emitted on client
    res.status(200).json({ 
      message: 'QR code available via connect endpoint' 
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get QR' });
  }
}
