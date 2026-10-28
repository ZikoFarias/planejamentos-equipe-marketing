CREATE TABLE IF NOT EXISTS marketing_sessions (
 token_hash TEXT PRIMARY KEY NOT NULL,
 email TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS marketing_sessions_expiry ON marketing_sessions(expires_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS marketing_login_attempts (
 key TEXT PRIMARY KEY NOT NULL,
 attempts INTEGER NOT NULL,
 reset_at INTEGER NOT NULL
);
