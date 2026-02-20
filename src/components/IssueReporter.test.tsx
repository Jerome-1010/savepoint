import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssueReporter } from './IssueReporter';

describe('IssueReporter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('FABボタンが表示されること', () => {
    render(<IssueReporter />);
    expect(screen.getByRole('button', { name: 'GitHub Issueを起票' })).toBeInTheDocument();
  });

  it('FABクリックでフォームが開くこと', async () => {
    const user = userEvent.setup();
    render(<IssueReporter />);

    await user.click(screen.getByRole('button', { name: 'GitHub Issueを起票' }));

    expect(screen.getByPlaceholderText('タイトル（必須）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('詳細（任意）')).toBeInTheDocument();
    expect(screen.getByText('起票する')).toBeInTheDocument();
  });

  it('タイトルが空の場合は送信ボタンが無効なこと', async () => {
    const user = userEvent.setup();
    render(<IssueReporter />);

    await user.click(screen.getByRole('button', { name: 'GitHub Issueを起票' }));

    expect(screen.getByText('起票する')).toBeDisabled();
  });

  it('fetchモック: 送信成功時に成功メッセージとIssueリンクが表示されること', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ number: 42, url: 'https://github.com/owner/repo/issues/42' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<IssueReporter />);

    await user.click(screen.getByRole('button', { name: 'GitHub Issueを起票' }));
    await user.type(screen.getByPlaceholderText('タイトル（必須）'), 'テストIssue');
    await user.click(screen.getByText('起票する'));

    await waitFor(() => {
      expect(screen.getByText(/を作成しました/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '#42' })).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テストIssue', body: '' }),
    });
  });

  it('fetchモック: 送信失敗時にエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to create issue' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<IssueReporter />);

    await user.click(screen.getByRole('button', { name: 'GitHub Issueを起票' }));
    await user.type(screen.getByPlaceholderText('タイトル（必須）'), 'テストIssue');
    await user.click(screen.getByText('起票する'));

    await waitFor(() => {
      expect(screen.getByText('Issueの作成に失敗しました。もう一度お試しください。')).toBeInTheDocument();
    });
  });

  it('Escキーでモーダルが閉じること', async () => {
    const user = userEvent.setup();
    render(<IssueReporter />);

    await user.click(screen.getByRole('button', { name: 'GitHub Issueを起票' }));
    expect(screen.getByPlaceholderText('タイトル（必須）')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByPlaceholderText('タイトル（必須）')).not.toBeInTheDocument();
  });
});
