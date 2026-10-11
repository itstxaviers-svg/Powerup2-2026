CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  join_code TEXT NOT NULL,
  avatar_id INTEGER NOT NULL,
  pin_hash TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS snapshots (
  student_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  event_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_events (
  event_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  received_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS students_join_code_idx ON students(join_code);
CREATE INDEX IF NOT EXISTS attempts_student_time_idx ON attempts(student_id, occurred_at DESC);
