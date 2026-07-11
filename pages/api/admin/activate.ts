import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, months } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  let expiryDate = null;
  if (months && months > 0) {
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
  }

  // Only update is_active and expiry_date - DON'T set activated_by
  const { error } = await supabase
    .from('users')
    .update({ 
      is_active: months && months > 0 ? 1 : 0,
      expiry_date: expiryDate?.toISOString() || null
      // REMOVED: activated_by: 'admin' - this was making everyone admin!
    })
    .eq('id', userId);

  if (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }

  res.status(200).json({ 
    success: true, 
    message: months && months > 0 ? 'User activated successfully' : 'User deactivated successfully',
    expiryDate: expiryDate?.toISOString() || null
  });
}