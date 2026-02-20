import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveModal } from './SaveModal';
import type { Task } from '../types';

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  name: 'Test Task',
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  progress: '',
  nextStep: '',
  remaining: '',
  ...overrides,
});

describe('SaveModal', () => {
  it('renders modal with task name', () => {
    const task = createTask({ name: 'My Task' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByText('セーブポイント')).toBeInTheDocument();
    expect(screen.getByText('「My Task」の進捗を保存します')).toBeInTheDocument();
  });

  it('renders custom saveLabel when provided', () => {
    const task = createTask({ name: 'My Task' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} saveLabel="タスクを作成" />);

    expect(screen.getByText('タスクを作成')).toBeInTheDocument();
  });

  it('renders custom subtitle when subtitle prop is provided', () => {
    const task = createTask({ name: 'My Task' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} subtitle="タスクを作成します" />);

    expect(screen.getByText('タスクを作成します')).toBeInTheDocument();
    expect(screen.queryByText('「My Task」の進捗を保存します')).not.toBeInTheDocument();
  });

  it('renders save and exit button when no next task', () => {
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByText('保存して終了')).toBeInTheDocument();
  });

  it('renders save and switch button when next task exists', () => {
    const task = createTask();
    const nextTask = createTask({ id: '2', name: 'Next Task' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={nextTask} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByText('保存して「Next Task」へ')).toBeInTheDocument();
  });

  it('initializes form with existing task data', () => {
    const task = createTask({
      progress: 'Existing progress',
      nextStep: 'Existing next step',
      remaining: 'Existing remaining',
    });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByDisplayValue('Existing progress')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing next step')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing remaining')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    await user.click(screen.getByText('キャンセル'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with form data when submitted', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    await user.type(screen.getByPlaceholderText('現在の進捗状況を記録...'), 'New progress');
    await user.type(screen.getByPlaceholderText('再開時に最初にやることを記録...'), 'New next step');
    await user.type(screen.getByPlaceholderText('忘れないようにメモ...'), 'New remaining');
    await user.click(screen.getByText('保存して終了'));

    expect(onSave).toHaveBeenCalledWith({
      progress: 'New progress',
      nextStep: 'New next step',
      remaining: 'New remaining',
    });
  });

  it('updates progress field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const progressInput = screen.getByPlaceholderText('現在の進捗状況を記録...');
    await user.type(progressInput, 'Updated progress');

    expect(progressInput).toHaveValue('Updated progress');
  });

  it('updates nextStep field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const nextStepInput = screen.getByPlaceholderText('再開時に最初にやることを記録...');
    await user.type(nextStepInput, 'Updated next step');

    expect(nextStepInput).toHaveValue('Updated next step');
  });

  it('updates remaining field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const remainingInput = screen.getByPlaceholderText('忘れないようにメモ...');
    await user.type(remainingInput, 'Updated remaining');

    expect(remainingInput).toHaveValue('Updated remaining');
  });
});
