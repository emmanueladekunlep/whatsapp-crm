import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, body, user_id } = req.body;

    if (!from || !body) {
      return res.status(400).json({ error: 'Missing webhook data' });
    }

    // Log incoming message
    await supabase
      .from('message_logs')
      .insert([{
        user_id: user_id || 1,
        phone_number: from,
        message: body,
        direction: 'incoming'
      }]);

    // Check for auto-reply rules
    const { data: rules } = await supabase
      .from('auto_reply_rules')
      .select('*')
      .eq('user_id', user_id || 1)
      .eq('is_active', true);

    if (rules && rules.length > 0) {
      // Find matching rule
      const matchedRule = rules.find(rule => {
        const messageLower = body.toLowerCase();
        const keywordLower = rule.trigger_keyword.toLowerCase();
        
        if (rule.match_type === 'contains') {
          return messageLower.includes(keywordLower);
        } else if (rule.match_type === 'exact') {
          return messageLower === keywordLower;
        } else if (rule.match_type === 'starts_with') {
          return messageLower.startsWith(keywordLower);
        }
        return false;
      });

      if (matchedRule) {
        // Send auto-reply via WhatsApp client (will be handled separately)
        // For now, just log the auto-reply
        await supabase
          .from('message_logs')
          .insert([{
            user_id: user_id || 1,
            phone_number: from,
            message: `[AUTO-REPLY] ${matchedRule.reply_message}`,
            direction: 'outgoing'
          }]);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}