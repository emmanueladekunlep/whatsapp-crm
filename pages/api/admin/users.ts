import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, business_name, phone, is_active, created_at, expiry_date')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  res.status(200).json(users);
}