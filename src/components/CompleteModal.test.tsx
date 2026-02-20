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
  it('renders modal with task name as h2', () => {
    const task = createTask({ name: 'My Task' });
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getByRole('heading', { name: 'My Task', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('タスクを完了します')).toBeInTheDocument();
  });

  it('initializes form with existing task data split by newlines', () => {
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

  it('calls onComplete with newline-joined strings when submitted', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const progressInputs = screen.getAllByPlaceholderText('完了時の状況や成果を記録...');
    const remainingInputs = screen.getAllByPlaceholderText('今後のために残しておきたいメモ...');

    await user.type(progressInputs[0], 'Completion notes');
    await user.type(remainingInputs[0], 'Future notes');
    await user.click(screen.getByText('完了にする'));

    expect(onComplete).toHaveBeenCalledWith({
      progress: 'Completion notes',
      nextStep: '',
      remaining: 'Future notes',
    });
  });

  it('adds a new list item when + 追加 button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const addButtons = screen.getAllByText('+ 追加');
    expect(screen.getAllByPlaceholderText('完了時の状況や成果を記録...')).toHaveLength(1);

    await user.click(addButtons[0]);

    expect(screen.getAllByPlaceholderText('完了時の状況や成果を記録...')).toHaveLength(2);
  });

  it('removes a list item when × button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask({ progress: 'item1\nitem2' });
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    expect(screen.getAllByPlaceholderText('完了時の状況や成果を記録...')).toHaveLength(2);

    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText('完了時の状況や成果を記録...')).toHaveLength(1);
  });

  it('disables remove button when only one item remains', () => {
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const removeButtons = screen.getAllByText('×');
    expect(removeButtons[0]).toBeDisabled();
  });

  it('submits multiple progress items joined by newlines', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const progressInputs = screen.getAllByPlaceholderText('完了時の状況や成果を記録...');
    await user.type(progressInputs[0], 'Done 1');

    const addButtons = screen.getAllByText('+ 追加');
    await user.click(addButtons[0]);

    const progressInputsAfter = screen.getAllByPlaceholderText('完了時の状況や成果を記録...');
    await user.type(progressInputsAfter[1], 'Done 2');

    await user.click(screen.getByText('完了にする'));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: 'Done 1\nDone 2',
      })
    );
  });

  it('updates progress field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const progressInput = screen.getAllByPlaceholderText('完了時の状況や成果を記録...')[0];
    await user.type(progressInput, 'Updated progress');

    expect(progressInput).toHaveValue('Updated progress');
  });

  it('updates remaining field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<CompleteModal task={task} onComplete={onComplete} onCancel={onCancel} />);

    const remainingInput = screen.getAllByPlaceholderText('今後のために残しておきたいメモ...')[0];
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
