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
  it('renders modal with task name', () => {
    const task = createTask({ name: 'My Task' });
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    expect(screen.getByText('ロード')).toBeInTheDocument();
    expect(screen.getByText('「My Task」を再開します')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /キャンセル/ }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when load button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /再開する/ }));

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

  it('calls onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when Cmd+Enter is pressed', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad when Ctrl+Enter is pressed', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onLoad = vi.fn();
    const onCancel = vi.fn();

    render(<LoadModal task={task} onLoad={onLoad} onCancel={onCancel} />);

    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});
