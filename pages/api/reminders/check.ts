 
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

declare global {
  var whatsappClients: Map<number, any>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date().toISOString();

    // Get all pending reminders due today
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        customers!inner (
          phone,
          name
        )
      `)
      .eq('is_done', 0)
      .lt('due_date', now);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch reminders' });
    }

    let sentCount = 0;

    // Send each reminder via WhatsApp
    for (const reminder of reminders || []) {
      const client = global.whatsappClients?.get(reminder.user_id);
      if (!client) continue;

      const phoneNumber = reminder.customers?.phone;
      if (!phoneNumber) continue;

      const message = `⏰ *REMINDER*\n\nCustomer: ${reminder.customers.name}\nTitle: ${reminder.title}\nDescription: ${reminder.description || 'No description'}\nDue: ${new Date(reminder.due_date).toLocaleDateString()}\n\nPlease follow up on this.`;

      try {
        await client.sendMessage(`${phoneNumber}@c.us`, message);
        sentCount++;

        // Log sent message
        await supabase
          .from('message_logs')
          .insert([{
            user_id: reminder.user_id,
            customer_id: reminder.customer_id,
            phone_number: phoneNumber,
            message: `[AUTO-REMINDER] ${message}`,
            direction: 'outgoing'
          }]);

        // Mark reminder as sent
        await supabase
          .from('reminders')
          .update({ is_sent: 1, sent_at: new Date().toISOString() })
          .eq('id', reminder.id);

      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${reminders?.length || 0} reminders, sent ${sentCount} via WhatsApp`
    });

  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Failed to process reminders' });
  }
}