import { Hono } from 'hono';
import { db, rowToTask, rowToHistory, type TaskRow, type Task, type HistoryRow } from '../db.js';

const tasks = new Hono();

// GET /api/tasks - 全タスク取得
tasks.get('/', (c) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at ASC').all() as TaskRow[];
  const taskList = rows.map(rowToTask);
  return c.json(taskList);
});

// POST /api/tasks - タスク作成
tasks.post('/', async (c) => {
  const body = await c.req.json<{ name: string }>();

  if (!body.name || typeof body.name !== 'string') {
    return c.json({ error: 'name is required' }, 400);
  }

  const now = Date.now();
  const id = `task-${now}-${Math.random().toString(36).slice(2, 9)}`;

  const stmt = db.prepare(`
    INSERT INTO tasks (id, name, status, created_at, updated_at, progress, next_step, remaining)
    VALUES (?, ?, 'paused', ?, ?, '', '', '')
  `);

  stmt.run(id, body.name, now, now);

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow;
  return c.json(rowToTask(row), 201);
});

// PUT /api/tasks/:id - タスク更新
tasks.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Task>>();

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }

  const now = Date.now();
  const updates: string[] = ['updated_at = ?'];
  const values: (string | number)[] = [now];

  if (body.name !== undefined) {
    updates.push('name = ?');
    values.push(body.name);
  }
  if (body.status !== undefined) {
    updates.push('status = ?');
    values.push(body.status);
  }
  if (body.progress !== undefined) {
    updates.push('progress = ?');
    values.push(body.progress);
  }
  if (body.nextStep !== undefined) {
    updates.push('next_step = ?');
    values.push(body.nextStep);
  }
  if (body.remaining !== undefined) {
    updates.push('remaining = ?');
    values.push(body.remaining);
  }

  values.push(id);

  const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow;

  // 更新内容に応じて履歴を記録
  const shouldRecord =
    body.status !== undefined ||
    body.progress !== undefined ||
    body.nextStep !== undefined ||
    body.remaining !== undefined;

  if (shouldRecord) {
    db.prepare(`
      INSERT INTO task_history (task_id, status, progress, next_step, remaining, saved_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(row.id, row.status, row.progress, row.next_step, row.remaining, Date.now());
  }

  return c.json(rowToTask(row));
});

// GET /api/tasks/:id/history - タスク履歴取得
tasks.get('/:id/history', (c) => {
  const id = c.req.param('id');
  const rows = db.prepare(
    'SELECT * FROM task_history WHERE task_id = ? ORDER BY saved_at DESC'
  ).all(id) as HistoryRow[];
  return c.json(rows.map(rowToHistory));
});

// DELETE /api/tasks/:id - タスク削除
tasks.delete('/:id', (c) => {
  const id = c.req.param('id');

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return c.json({ success: true });
});

export default tasks;
