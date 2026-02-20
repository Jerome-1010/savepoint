import { Hono } from 'hono';

const issues = new Hono();

issues.post('/', async (c) => {
  const { title, body } = await c.req.json<{ title: string; body?: string }>();

  if (!title?.trim()) {
    return c.json({ error: 'Title is required' }, 400);
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return c.json({ error: 'GitHub configuration missing' }, 500);
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title: title.trim(), body: body?.trim() ?? '', labels: ['from-app'] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return c.json({ error: 'Failed to create issue', details: err }, 500);
  }

  const issue = await res.json() as { number: number; html_url: string };
  return c.json({ number: issue.number, url: issue.html_url }, 201);
});

export default issues;
