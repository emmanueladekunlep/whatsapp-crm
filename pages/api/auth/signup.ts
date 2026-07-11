import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, business_name, phone } = req.body;

  if (!email || !password || !business_name) {
    return res.status(400).json({ error: 'Email, password, and business name required' });
  }

  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email);

  if (existing && existing.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user (inactive by default)
  const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        email, 
        password: hashedPassword, 
        business_name, 
        phone: phone || '',
        is_active: 0 
      }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: 'Failed to create account' });
  }

  res.status(201).json({
    success: true,
    message: 'Account created. Contact admin to activate.',
    userId: data[0].id
  });
}