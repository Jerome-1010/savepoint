import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadModal } from './LoadModal';
import type { Task } from '../types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  name: 'Test Task',
  status: 'paused',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  progress: '',
  nextStep: '',
  remaining: '',
  ...overrides,
});

describe('LoadModal', () => {
  it('renders modal with task name as h2', () => {
    const task = createTask({ name: 'My Task' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByRole('heading', { name: 'My Task', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('タスクを再開します')).toBeInTheDocument();
  });

  it('renders no save data message when task has no progress data', () => {
    const task = createTask({ progress: '', nextStep: '', remaining: '' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('セーブデータがありません')).toBeInTheDocument();
    expect(screen.getByText('新しく始めましょう')).toBeInTheDocument();
  });

  it('renders progress section when task has progress', () => {
    const task = createTask({ progress: 'Some progress made' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('前回の進捗')).toBeInTheDocument();
    expect(screen.getByText('Some progress made')).toBeInTheDocument();
  });

  it('renders nextStep section when task has nextStep', () => {
    const task = createTask({ nextStep: 'Next thing to do' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('次にやること')).toBeInTheDocument();
    expect(screen.getByText('Next thing to do')).toBeInTheDocument();
  });

  it('renders remaining section when task has remaining', () => {
    const task = createTask({ remaining: 'Things left to do' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('残タスク')).toBeInTheDocument();
    expect(screen.getByText('Things left to do')).toBeInTheDocument();
  });

  it('renders all sections when task has all progress data', () => {
    const task = createTask({
      progress: 'Progress data',
      nextStep: 'Next step data',
      remaining: 'Remaining data',
    });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('前回の進捗')).toBeInTheDocument();
    expect(screen.getByText('次にやること')).toBeInTheDocument();
    expect(screen.getByText('残タスク')).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    const timestamp = new Date('2024-03-15T10:30:00').getTime();
    const task = createTask({ updatedAt: timestamp, progress: 'Some progress' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText(/最終セーブ:/)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.click(screen.getByText('キャンセル'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when load button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.click(screen.getByText('再開する'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('does not show progress section when progress is empty', () => {
    const task = createTask({ progress: '', nextStep: 'Some next step' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.queryByText('前回の進捗')).not.toBeInTheDocument();
    expect(screen.getByText('次にやること')).toBeInTheDocument();
  });

  it('does not show nextStep section when nextStep is empty', () => {
    const task = createTask({ progress: 'Some progress', nextStep: '' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('前回の進捗')).toBeInTheDocument();
    expect(screen.queryByText('次にやること')).not.toBeInTheDocument();
  });

  it('does not show remaining section when remaining is empty', () => {
    const task = createTask({ progress: 'Some progress', remaining: '' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('前回の進捗')).toBeInTheDocument();
    expect(screen.queryByText('残タスク')).not.toBeInTheDocument();
  });

  it('renders newline-delimited progress data as multiple list items', () => {
    const task = createTask({ progress: 'Item 1\nItem 2\nItem 3' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders newline-delimited nextStep data as multiple list items', () => {
    const task = createTask({ nextStep: 'Step A\nStep B' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('Step A')).toBeInTheDocument();
    expect(screen.getByText('Step B')).toBeInTheDocument();
  });
});
