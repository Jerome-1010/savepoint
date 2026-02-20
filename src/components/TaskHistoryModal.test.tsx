import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskHistoryModal } from './TaskHistoryModal';
import type { Task, TaskHistoryEntry } from '../types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'Test Task',
  status: 'paused',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  progress: '',
  nextStep: '',
  remaining: '',
  ...overrides,
});

const createHistoryEntry = (overrides: Partial<TaskHistoryEntry> = {}): TaskHistoryEntry => ({
  id: 1,
  taskId: 'task-1',
  status: 'paused',
  progress: 'Progress text',
  nextStep: 'Next step text',
  remaining: 'Remaining text',
  savedAt: new Date('2024-03-15T10:30:00').getTime(),
  ...overrides,
});

describe('TaskHistoryModal', () => {
  it('shows loading state initially', () => {
    const task = createTask();
    const fetchHistory = vi.fn(() => new Promise<TaskHistoryEntry[]>(() => {}));
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('shows task name in subtitle', async () => {
    const task = createTask({ name: 'My Task' });
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    expect(screen.getByText('My Task')).toBeInTheDocument();
  });

  it('shows empty state when history is empty', async () => {
    const task = createTask();
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('まだ更新履歴がありません')).toBeInTheDocument();
    });
  });

  it('renders history entries when history is available', async () => {
    const task = createTask();
    const entry = createHistoryEntry({
      progress: 'Did this thing',
      nextStep: 'Next do that',
      remaining: 'Still need to do X',
    });
    const fetchHistory = vi.fn().mockResolvedValue([entry]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Did this thing')).toBeInTheDocument();
    });

    expect(screen.getByText('Next do that')).toBeInTheDocument();
    expect(screen.getByText('Still need to do X')).toBeInTheDocument();
  });

  it('renders status labels for history entries', async () => {
    const task = createTask();
    const entries = [
      createHistoryEntry({ id: 1, status: 'paused', savedAt: Date.now() - 2000 }),
      createHistoryEntry({ id: 2, status: 'active', savedAt: Date.now() - 1000 }),
      createHistoryEntry({ id: 3, status: 'completed', savedAt: Date.now() }),
    ];
    const fetchHistory = vi.fn().mockResolvedValue(entries);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('中断').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('閉じる')).toBeInTheDocument();
    });

    await user.click(screen.getByText('閉じる'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls fetchHistory with the task id on mount', async () => {
    const task = createTask({ id: 'task-abc-123' });
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(fetchHistory).toHaveBeenCalledWith('task-abc-123');
    });
  });

  it('does not show sections for empty fields in history entry', async () => {
    const task = createTask();
    const entry = createHistoryEntry({
      progress: '',
      nextStep: '',
      remaining: '',
    });
    const fetchHistory = vi.fn().mockResolvedValue([entry]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('どこまで進んだか')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('次のステップ')).not.toBeInTheDocument();
    expect(screen.queryByText('残っている課題')).not.toBeInTheDocument();
  });

  it('shows modal title', () => {
    const task = createTask();
    const fetchHistory = vi.fn().mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <TaskHistoryModal
        task={task}
        fetchHistory={fetchHistory}
        onClose={onClose}
      />
    );

    expect(screen.getByText('更新履歴')).toBeInTheDocument();
  });
});
