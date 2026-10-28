CREATE TABLE IF NOT EXISTS marketing_spelling_jobs (
 task_id TEXT NOT NULL,
 fingerprint TEXT NOT NULL,
 state TEXT NOT NULL,
 requested_at INTEGER NOT NULL,
 PRIMARY KEY(task_id,fingerprint)
);
CREATE TABLE IF NOT EXISTS marketing_spelling_quota (
 day TEXT PRIMARY KEY,
 used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS marketing_spelling_queue (
 task_id TEXT PRIMARY KEY,
 queued_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS marketing_spelling_queue_time ON marketing_spelling_queue(queued_at);
