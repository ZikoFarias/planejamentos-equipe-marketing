CREATE TABLE IF NOT EXISTS marketing_drive_auth_state(state_hash TEXT PRIMARY KEY,session_hash TEXT NOT NULL,verifier TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS marketing_drive_connection(id INTEGER PRIMARY KEY CHECK(id=1),email TEXT NOT NULL,encrypted_refresh TEXT NOT NULL,connected_at TEXT NOT NULL);
