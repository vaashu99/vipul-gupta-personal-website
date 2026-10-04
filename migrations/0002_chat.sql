CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  visitor_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('visitor', 'owner')),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS chat_messages_thread_id ON chat_messages(thread_id, id);
CREATE INDEX IF NOT EXISTS chat_threads_updated_at ON chat_threads(updated_at DESC);
