CREATE TABLE IF NOT EXISTS marketing_notifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,event_key TEXT NOT NULL UNIQUE,email TEXT NOT NULL,kind TEXT NOT NULL,
 task_id TEXT,title TEXT NOT NULL,message TEXT NOT NULL,targets TEXT NOT NULL DEFAULT '[]',
 created_at TEXT NOT NULL,read_at TEXT,seen_at TEXT
);
CREATE INDEX IF NOT EXISTS marketing_notifications_owner ON marketing_notifications(email,id DESC);
CREATE TABLE IF NOT EXISTS marketing_notification_changes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,revision INTEGER NOT NULL,task_id TEXT NOT NULL,
 old_task TEXT,next_task TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(revision,task_id)
);
CREATE TABLE IF NOT EXISTS marketing_notification_days(day TEXT PRIMARY KEY,created_at TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS marketing_notification_capture
AFTER UPDATE OF data ON marketing_board
WHEN NEW.revision>OLD.revision AND NEW.data IS NOT OLD.data
BEGIN
 INSERT OR IGNORE INTO marketing_notification_changes(revision,task_id,old_task,next_task,created_at)
 SELECT NEW.revision,json_extract(next.value,'$.id'),CASE WHEN prior.key IS NULL THEN NULL ELSE json_object('id',json_extract(prior.value,'$.id'),'title',json_extract(prior.value,'$.title'),'status',json_extract(prior.value,'$.status'),'assignees',json(coalesce(json_extract(prior.value,'$.assignees'),'[]')),'tags',json(coalesce(json_extract(prior.value,'$.tags'),'[]')),'workflowResume',json_extract(prior.value,'$.workflowResume'),'approval',json(coalesce(json_extract(prior.value,'$.approval'),'null')),'purchase',json(CASE WHEN json_type(prior.value,'$.purchase')='object' THEN json_object('requiresArt',json(CASE WHEN json_extract(prior.value,'$.purchase.requiresArt')=0 THEN 'false' ELSE 'true' END),'stage',json_extract(prior.value,'$.purchase.stage')) ELSE 'null' END)) END,json_object('id',json_extract(next.value,'$.id'),'title',json_extract(next.value,'$.title'),'status',json_extract(next.value,'$.status'),'assignees',json(coalesce(json_extract(next.value,'$.assignees'),'[]')),'tags',json(coalesce(json_extract(next.value,'$.tags'),'[]')),'workflowResume',json_extract(next.value,'$.workflowResume'),'approval',json(coalesce(json_extract(next.value,'$.approval'),'null')),'purchase',json(CASE WHEN json_type(next.value,'$.purchase')='object' THEN json_object('requiresArt',json(CASE WHEN json_extract(next.value,'$.purchase.requiresArt')=0 THEN 'false' ELSE 'true' END),'stage',json_extract(next.value,'$.purchase.stage')) ELSE 'null' END)),strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM json_each(NEW.data) next
 LEFT JOIN json_each(OLD.data) prior ON json_extract(prior.value,'$.id')=json_extract(next.value,'$.id')
 WHERE prior.key IS NULL OR json_object('id',json_extract(prior.value,'$.id'),'title',json_extract(prior.value,'$.title'),'status',json_extract(prior.value,'$.status'),'assignees',json(coalesce(json_extract(prior.value,'$.assignees'),'[]')),'tags',json(coalesce(json_extract(prior.value,'$.tags'),'[]')),'workflowResume',json_extract(prior.value,'$.workflowResume'),'approval',json(coalesce(json_extract(prior.value,'$.approval'),'null')),'purchase',json(CASE WHEN json_type(prior.value,'$.purchase')='object' THEN json_object('requiresArt',json(CASE WHEN json_extract(prior.value,'$.purchase.requiresArt')=0 THEN 'false' ELSE 'true' END),'stage',json_extract(prior.value,'$.purchase.stage')) ELSE 'null' END)) IS NOT json_object('id',json_extract(next.value,'$.id'),'title',json_extract(next.value,'$.title'),'status',json_extract(next.value,'$.status'),'assignees',json(coalesce(json_extract(next.value,'$.assignees'),'[]')),'tags',json(coalesce(json_extract(next.value,'$.tags'),'[]')),'workflowResume',json_extract(next.value,'$.workflowResume'),'approval',json(coalesce(json_extract(next.value,'$.approval'),'null')),'purchase',json(CASE WHEN json_type(next.value,'$.purchase')='object' THEN json_object('requiresArt',json(CASE WHEN json_extract(next.value,'$.purchase.requiresArt')=0 THEN 'false' ELSE 'true' END),'stage',json_extract(next.value,'$.purchase.stage')) ELSE 'null' END));
END;
