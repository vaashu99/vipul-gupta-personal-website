-- Preserve all existing conversations and messages. Legacy senders remain NULL.
-- These contact details are self-reported, private, and never used for sign-in.
ALTER TABLE chat_threads ADD COLUMN sender_name TEXT
  CHECK (sender_name IS NULL OR length(sender_name) BETWEEN 1 AND 100);
ALTER TABLE chat_threads ADD COLUMN sender_contact_type TEXT
  CHECK (sender_contact_type IS NULL OR sender_contact_type IN ('email', 'phone'));
ALTER TABLE chat_threads ADD COLUMN sender_contact_value TEXT
  CHECK (sender_contact_value IS NULL OR length(sender_contact_value) BETWEEN 1 AND 254);
