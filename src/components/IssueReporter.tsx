import { useState, useEffect } from 'react';
import './IssueReporter.css';

export function IssueReporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ number: number; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, title, body]);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create issue');
      const data = await res.json();
      setResult(data);
      setTitle('');
      setBody('');
    } catch {
      setError('Issueの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="issue-reporter-fab"
        onClick={() => { setIsOpen(true); setResult(null); setError(null); }}
        title="GitHub Issueを起票"
        aria-label="GitHub Issueを起票"
      >
        📋
      </button>

      {isOpen && (
        <div className="issue-reporter-overlay" onClick={() => setIsOpen(false)}>
          <div className="issue-reporter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-reporter-header">
              <h3>Issue を起票</h3>
              <button className="issue-reporter-close" onClick={() => setIsOpen(false)}>×</button>
            </div>

            {result ? (
              <div className="issue-reporter-success">
                <p>✅ Issue <a href={result.url} target="_blank" rel="noopener noreferrer">#{result.number}</a> を作成しました</p>
                <button className="btn btn-secondary" onClick={() => { setResult(null); }}>続けて起票</button>
              </div>
            ) : (
              <>
                <input
                  className="issue-reporter-title-input"
                  type="text"
                  placeholder="タイトル（必須）"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="issue-reporter-body-input"
                  placeholder="詳細（任意）"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                />
                {error && <p className="issue-reporter-error">{error}</p>}
                <div className="issue-reporter-actions">
                  <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                    キャンセル <span className="shortcut-hint">Esc</span>
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!title.trim() || isSubmitting}
                  >
                    {isSubmitting ? '送信中...' : '起票する'}
                    {!isSubmitting && <span className="shortcut-hint">⌘+Enter</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
