import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-change-this-in-production';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Get user from database
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check password
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if active
  if (!user.is_active) {
    return res.status(403).json({ 
      error: 'Account inactive. Please contact admin to activate your account.',
      inactive: true 
    });
  }

  // Check expiry
  if (user.expiry_date) {
    const expiry = new Date(user.expiry_date);
    if (expiry < new Date()) {
      return res.status(403).json({ 
        error: 'Subscription expired. Please renew.',
        expired: true 
      });
    }
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      business_name: user.business_name,
      is_active: user.is_active,
      expiry_date: user.expiry_date
    }
  });
}