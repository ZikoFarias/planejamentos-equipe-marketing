CREATE TABLE IF NOT EXISTS marketing_login_challenges (
 token_hash TEXT PRIMARY KEY NOT NULL,
 email TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS marketing_login_challenges_expiry ON marketing_login_challenges(expires_at);
