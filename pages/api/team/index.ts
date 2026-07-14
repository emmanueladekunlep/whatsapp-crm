 import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const businessId = decoded.id;

    // GET - Fetch all team members
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, email, name, role, is_active, created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch team members' });
      }

      return res.status(200).json(data);
    }

    // POST - Add team member
    if (req.method === 'POST') {
      const { email, name, role, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Email, name, and password required' });
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', email);

      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          business_id: businessId,
          email,
          name,
          role: role || 'member',
          password_hash: hashedPassword,
          is_active: true
        }])
        .select();

      if (error) {
        return res.status(500).json({ error: 'Failed to add team member' });
      }

      return res.status(201).json({
        success: true,
        message: 'Team member added',
        member: data[0]
      });
    }

    // PUT - Update team member
    if (req.method === 'PUT') {
      const { id, name, role, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Member ID required' });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (role) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .eq('business_id', businessId);

      if (error) {
        return res.status(500).json({ error: 'Failed to update team member' });
      }

      return res.status(200).json({
        success: true,
        message: 'Team member updated'
      });
    }

    // DELETE - Remove team member
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Member ID required' });
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)
        .eq('business_id', businessId);

      if (error) {
        return res.status(500).json({ error: 'Failed to remove team member' });
      }

      return res.status(200).json({
        success: true,
        message: 'Team member removed'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Team API error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
