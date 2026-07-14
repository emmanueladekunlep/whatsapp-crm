import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Check if team member exists
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', email);

    if (error || !members || members.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const member = members[0];

    // Check password
    const isValid = bcrypt.compareSync(password, member.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if active
    if (!member.is_active) {
      return res.status(403).json({ 
        error: 'Account inactive. Contact your business admin.',
        inactive: true 
      });
    }

    // Get business owner info
    const { data: business } = await supabase
      .from('users')
      .select('business_name, is_active, expiry_date')
      .eq('id', member.business_id);

    // Generate token
    const token = jwt.sign(
      { id: member.id, email: member.email, role: member.role, business_id: member.business_id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      user: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        business_name: business?.[0]?.business_name || 'Business',
        is_active: member.is_active,
        isTeamMember: true
      }
    });
  } catch (error) {
    console.error('Team login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}