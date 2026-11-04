-- Only future board changes enqueue files. Existing Drive backups are left untouched.
CREATE TABLE IF NOT EXISTS marketing_drive_cleanup(
 file_id TEXT PRIMARY KEY,desired_trashed INTEGER NOT NULL CHECK(desired_trashed IN(0,1)),
 generation INTEGER NOT NULL DEFAULT 1,applied_generation INTEGER NOT NULL DEFAULT 0,
 next_attempt INTEGER NOT NULL DEFAULT 0,attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS marketing_drive_cleanup_pending ON marketing_drive_cleanup(next_attempt,applied_generation,generation);
CREATE TRIGGER IF NOT EXISTS marketing_drive_cleanup_board AFTER UPDATE OF data ON marketing_board
WHEN OLD.data<>NEW.data
BEGIN
 INSERT INTO marketing_drive_cleanup(file_id,desired_trashed)
 SELECT u.file_id,1 FROM marketing_central_uploads u
 WHERE u.task_id NOT IN ('_profile','_background')
 AND u.file_id IN (SELECT json_extract(a.value,'$.drive.fileId') AS file_id FROM json_each(OLD.data) t,json_each(t.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1
 UNION SELECT json_extract(a.value,'$.drive.fileId') FROM json_each(OLD.data) t,json_each(t.value,'$.comments') c,json_each(c.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1)
 AND u.file_id NOT IN (SELECT json_extract(a.value,'$.drive.fileId') AS file_id FROM json_each(NEW.data) t,json_each(t.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1
 UNION SELECT json_extract(a.value,'$.drive.fileId') FROM json_each(NEW.data) t,json_each(t.value,'$.comments') c,json_each(c.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1)
 ON CONFLICT(file_id) DO UPDATE SET desired_trashed=1,generation=generation+1,next_attempt=0,attempts=0;
 UPDATE marketing_drive_cleanup SET desired_trashed=0,generation=generation+1,next_attempt=0,attempts=0
 WHERE desired_trashed=1 AND file_id IN (SELECT json_extract(a.value,'$.drive.fileId') AS file_id FROM json_each(NEW.data) t,json_each(t.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1
 UNION SELECT json_extract(a.value,'$.drive.fileId') FROM json_each(NEW.data) t,json_each(t.value,'$.comments') c,json_each(c.value,'$.attachments') a WHERE json_extract(a.value,'$.drive.central')=1);
END;
