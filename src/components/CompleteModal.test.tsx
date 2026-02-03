import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteModal } from './CompleteModal';
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

describe('CompleteModal', () => {
  it('renders modal with task name', () => {
    const task = createTask({ name: 'My Task' });
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByText('タスク完了')).toBeInTheDocument();
    expect(screen.getByText('「My Task」を完了としてマークします')).toBeInTheDocument();
  });

  it('initializes form with existing task data', () => {
    const task = createTask({
      progress: 'Existing progress',
      remaining: 'Existing remaining',
    });
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByDisplayValue('Existing progress')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing remaining')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    await user.click(screen.getByText('キャンセル'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete with form data when submitted', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    await user.type(screen.getByPlaceholderText('完了時の状況や成果を記録...'), 'Completion notes');
    await user.type(screen.getByPlaceholderText('今後のために残しておきたいメモ...'), 'Future notes');
    await user.click(screen.getByText('完了にする'));

    expect(onComplete).toHaveBeenCalledWith({
      progress: 'Completion notes',
      nextStep: '',
      remaining: 'Future notes',
    });
  });

  it('updates progress field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const progressInput = screen.getByPlaceholderText('完了時の状況や成果を記録...');
    await user.type(progressInput, 'Updated progress');

    expect(progressInput).toHaveValue('Updated progress');
  });

  it('updates remaining field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const remainingInput = screen.getByPlaceholderText('今後のために残しておきたいメモ...');
    await user.type(remainingInput, 'Updated remaining');

    expect(remainingInput).toHaveValue('Updated remaining');
  });

  it('submits empty nextStep when completing task', async () => {
    const user = userEvent.setup();
    const task = createTask({ nextStep: 'This should be cleared' });
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    await user.click(screen.getByText('完了にする'));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        nextStep: '',
      })
    );
  });
});
