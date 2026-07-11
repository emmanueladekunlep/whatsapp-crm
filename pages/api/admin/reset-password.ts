import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', userId);

  if (error) {
    return res.status(500).json({ error: 'Failed to reset password' });
  }

  res.status(200).json({ 
    success: true, 
    message: 'Password reset successfully'
  });
}