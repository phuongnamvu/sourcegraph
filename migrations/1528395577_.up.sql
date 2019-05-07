BEGIN;

ALTER TABLE discussion_threads ADD COLUMN kind text;
ALTER TABLE discussion_threads ADD COLUMN settings text;
ALTER TABLE discussion_threads ADD COLUMN parent_thread_id bigint REFERENCES threads(id) ON DELETE RESTRICT;
CREATE INDEX ON discussion_threads(parent_thread_id);

CREATE TABLE labels (
       id bigserial PRIMARY KEY,
       name citext NOT NULL,
       description text,
       -- TODO!(sqs): make labels unique within a specific namespace
       color_hex text NOT NULL
);
CREATE INDEX ON labels(name);

CREATE TABLE threads_labels (
       thread_id bigint NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
       label_id bigint NOT NULL REFERENCES labels(id) ON DELETE CASCADE
);
CREATE INDEX ON threads_labels(thread_id);
CREATE INDEX ON threads_labels(label_id);

CREATE TABLE threads_assignees (
       thread_id bigint NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
       user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX ON threads_assignees(thread_id);
CREATE INDEX ON threads_assignees(user_id);

COMMIT;
