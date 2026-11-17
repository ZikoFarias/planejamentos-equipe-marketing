CREATE TABLE IF NOT EXISTS marketing_board_undo (
  revision INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  patch TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'applied',
  undone_at INTEGER
);
CREATE INDEX IF NOT EXISTS marketing_board_undo_owner ON marketing_board_undo(email, state, revision);
