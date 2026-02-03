import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import tasks from './routes/tasks.js';

const app = new Hono();

// ログ出力
app.use('*', logger());

// API ルート
app.route('/api/tasks', tasks);

// 静的ファイル配信（Viteビルド成果物）
app.use('/*', serveStatic({ root: './dist' }));

// SPA フォールバック
app.get('*', serveStatic({ root: './dist', path: 'index.html' }));

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
