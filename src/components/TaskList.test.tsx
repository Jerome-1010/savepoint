import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
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

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(screen.getByText('新しいタスクを追加してください')).toBeInTheDocument();
  });

  it('renders active tasks section when there are non-completed tasks', () => {
    const task = createTask({ status: 'paused' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders completed tasks section when there are completed tasks', () => {
    const task = createTask({ status: 'completed' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });

  it('renders both sections when there are active and completed tasks', () => {
    const activeTask = createTask({ id: '1', status: 'paused', name: 'Active Task' });
    const completedTask = createTask({ id: '2', status: 'completed', name: 'Completed Task' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[activeTask, completedTask]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });

  it('displays correct status icon for active task', () => {
    const task = createTask({ id: '1', status: 'active' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId="1"
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('▶️')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('displays correct status icon for paused task', () => {
    const task = createTask({ status: 'paused' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('⏸️')).toBeInTheDocument();
    expect(screen.getByText('中断')).toBeInTheDocument();
  });

  it('displays default status icon for active task not matching activeTaskId', () => {
    const task = createTask({ id: '1', status: 'active' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId="different-id"
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    // When status is 'active' but id doesn't match activeTaskId, shows default icon
    expect(screen.getByText('⏸️')).toBeInTheDocument();
  });

  it('displays correct status icon for completed task', () => {
    const task = createTask({ status: 'completed' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('displays next step hint for paused task with nextStep', () => {
    const task = createTask({
      status: 'paused',
      nextStep: 'This is a very long next step that should be truncated',
    });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    // The text is split across multiple elements, so we check for the container
    expect(screen.getByText((content, element) => {
      return element?.className === 'task-next-hint' && content.includes('次:');
    })).toBeInTheDocument();
  });

  it('does not display next step hint for completed task', () => {
    const task = createTask({
      status: 'completed',
      nextStep: 'This should not show',
    });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.queryByText(/次:/)).not.toBeInTheDocument();
  });

  it('calls onSelect when clicking on non-completed task', async () => {
    const user = userEvent.setup();
    const task = createTask({ status: 'paused' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    await user.click(screen.getByText('Test Task'));

    expect(onSelect).toHaveBeenCalledWith(task);
  });

  it('does not call onSelect when clicking on completed task', async () => {
    const user = userEvent.setup();
    const task = createTask({ status: 'completed' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    await user.click(screen.getByText('Test Task'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onComplete when clicking complete button on non-completed task', async () => {
    const user = userEvent.setup();
    const task = createTask({ status: 'paused' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    await user.click(screen.getByTitle('完了にする'));

    expect(onComplete).toHaveBeenCalledWith(task);
  });

  it('does not show complete button for completed task', () => {
    const task = createTask({ status: 'completed' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.queryByTitle('完了にする')).not.toBeInTheDocument();
  });

  it('calls onDelete when clicking delete button', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    await user.click(screen.getByTitle('削除'));

    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it('formats date correctly', () => {
    const timestamp = new Date('2024-03-15').getTime();
    const task = createTask({ updatedAt: timestamp });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.getByText('3月15日')).toBeInTheDocument();
  });

  it('does not display next step hint when nextStep is empty', () => {
    const task = createTask({
      status: 'paused',
      nextStep: '',
    });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    expect(screen.queryByText(/次:/)).not.toBeInTheDocument();
  });

  it('calls onHistory when clicking history button', async () => {
    const user = userEvent.setup();
    const task = createTask({ status: 'paused' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[task]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    await user.click(screen.getByTitle('更新履歴'));

    expect(onHistory).toHaveBeenCalledWith(task);
  });

  it('shows history button for both active and completed tasks', () => {
    const activeTask = createTask({ id: '1', status: 'paused', name: 'Active Task' });
    const completedTask = createTask({ id: '2', status: 'completed', name: 'Completed Task' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();
    const onDelete = vi.fn();
    const onHistory = vi.fn();

    render(
      <TaskList
        tasks={[activeTask, completedTask]}
        activeTaskId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onDelete={onDelete}
        onHistory={onHistory}
      />
    );

    const historyButtons = screen.getAllByTitle('更新履歴');
    expect(historyButtons).toHaveLength(2);
  });
});
