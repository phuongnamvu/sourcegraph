BEGIN;

DROP TABLE IF EXISTS threads_labels;
DROP TABLE IF EXISTS labels;
DROP TABLE IF EXISTS threads_assignees;

ALTER TABLE discussion_threads DROP COLUMN kind;
ALTER TABLE discussion_threads DROP COLUMN settings;
ALTER TABLE discussion_threads DROP COLUMN parent_thread_id;

COMMIT;
