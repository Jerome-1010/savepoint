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
  it('renders modal with task name as h2', () => {
    const task = createTask({ name: 'My Task' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByRole('heading', { name: 'My Task', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('進捗を保存します')).toBeInTheDocument();
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

  it('initializes form with existing task data split by newlines', () => {
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

  it('calls onSave with newline-joined strings when submitted', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const progressInputs = screen.getAllByPlaceholderText('進捗を入力...');
    const nextStepInputs = screen.getAllByPlaceholderText('次のステップを入力...');
    const remainingInputs = screen.getAllByPlaceholderText('残タスクを入力...');

    await user.type(progressInputs[0], 'New progress');
    await user.type(nextStepInputs[0], 'New next step');
    await user.type(remainingInputs[0], 'New remaining');
    await user.click(screen.getByText('保存して終了'));

    expect(onSave).toHaveBeenCalledWith({
      progress: 'New progress',
      nextStep: 'New next step',
      remaining: 'New remaining',
    });
  });

  it('adds a new list item when + 追加 button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const addButtons = screen.getAllByText('+ 追加');
    expect(screen.getAllByPlaceholderText('進捗を入力...')).toHaveLength(1);

    await user.click(addButtons[0]);

    expect(screen.getAllByPlaceholderText('進捗を入力...')).toHaveLength(2);
  });

  it('removes a list item when × button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask({ progress: 'item1\nitem2' });
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getAllByPlaceholderText('進捗を入力...')).toHaveLength(2);

    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText('進捗を入力...')).toHaveLength(1);
  });

  it('disables remove button when only one item remains', () => {
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const removeButtons = screen.getAllByText('×');
    expect(removeButtons[0]).toBeDisabled();
  });

  it('submits multiple progress items joined by newlines', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const progressInputs = screen.getAllByPlaceholderText('進捗を入力...');
    await user.type(progressInputs[0], 'Step 1');

    const addButtons = screen.getAllByText('+ 追加');
    await user.click(addButtons[0]);

    const progressInputsAfter = screen.getAllByPlaceholderText('進捗を入力...');
    await user.type(progressInputsAfter[1], 'Step 2');

    await user.click(screen.getByText('保存して終了'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: 'Step 1\nStep 2',
      })
    );
  });

  it('updates progress field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const progressInput = screen.getAllByPlaceholderText('進捗を入力...')[0];
    await user.type(progressInput, 'Updated progress');

    expect(progressInput).toHaveValue('Updated progress');
  });

  it('updates nextStep field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const nextStepInput = screen.getAllByPlaceholderText('次のステップを入力...')[0];
    await user.type(nextStepInput, 'Updated next step');

    expect(nextStepInput).toHaveValue('Updated next step');
  });

  it('updates remaining field on change', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<SaveModal task={task} nextTask={null} onSave={onSave} onCancel={onCancel} />);

    const remainingInput = screen.getAllByPlaceholderText('残タスクを入力...')[0];
    await user.type(remainingInput, 'Updated remaining');

    expect(remainingInput).toHaveValue('Updated remaining');
  });
});
