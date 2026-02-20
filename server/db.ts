import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'savepoint.db');

export const db = new Database(dbPath);

// WAL モードを有効化（パフォーマンス向上）
db.pragma('journal_mode = WAL');

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'paused',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    progress TEXT NOT NULL DEFAULT '',
    next_step TEXT NOT NULL DEFAULT '',
    remaining TEXT NOT NULL DEFAULT ''
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS task_history (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id    TEXT NOT NULL,
    status     TEXT NOT NULL,
    progress   TEXT NOT NULL DEFAULT '',
    next_step  TEXT NOT NULL DEFAULT '',
    remaining  TEXT NOT NULL DEFAULT '',
    saved_at   INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

export interface TaskRow {
  id: string;
  name: string;
  status: string;
  created_at: number;
  updated_at: number;
  progress: string;
  next_step: string;
  remaining: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  updatedAt: number;
  progress: string;
  nextStep: string;
  remaining: string;
}

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Task['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: row.progress,
    nextStep: row.next_step,
    remaining: row.remaining,
  };
}

export interface HistoryRow {
  id: number;
  task_id: string;
  status: string;
  progress: string;
  next_step: string;
  remaining: string;
  saved_at: number;
}

export interface TaskHistory {
  id: number;
  taskId: string;
  status: 'active' | 'paused' | 'completed';
  progress: string;
  nextStep: string;
  remaining: string;
  savedAt: number;
}

export function rowToHistory(row: HistoryRow): TaskHistory {
  return {
    id: row.id,
    taskId: row.task_id,
    status: row.status as TaskHistory['status'],
    progress: row.progress,
    nextStep: row.next_step,
    remaining: row.remaining,
    savedAt: row.saved_at,
  };
}
