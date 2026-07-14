 -- WhatsApp Sessions
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_data TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT 0,
  phone_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Auto-Reply Rules
CREATE TABLE IF NOT EXISTS auto_reply_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trigger_keyword TEXT NOT NULL,
  reply_message TEXT NOT NULL,
  match_type TEXT DEFAULT 'contains',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Message Logs
CREATE TABLE IF NOT EXISTS message_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  customer_id INTEGER,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES users(id)
);

-- Add columns to reminders
ALTER TABLE reminders ADD COLUMN send_via_whatsapp BOOLEAN DEFAULT 0;
ALTER TABLE reminders ADD COLUMN is_sent BOOLEAN DEFAULT 0;

-- Add columns to quotes
ALTER TABLE quotes ADD COLUMN pdf_url TEXT;
ALTER TABLE quotes ADD COLUMN sent_to_whatsapp BOOLEAN DEFAULT 0;
