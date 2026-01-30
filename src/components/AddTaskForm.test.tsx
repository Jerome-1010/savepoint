import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskForm } from './AddTaskForm';

describe('AddTaskForm', () => {
  it('renders add task button when collapsed', () => {
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument();
  });

  it('expands form when add button is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));

    expect(screen.getByPlaceholderText('タスク名を入力...')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('collapses form when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    await user.click(screen.getByText('キャンセル'));

    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('タスク名を入力...')).not.toBeInTheDocument();
  });

  it('disables submit button when input is empty', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));

    expect(screen.getByText('追加')).toBeDisabled();
  });

  it('disables submit button when input is only whitespace', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    await user.type(screen.getByPlaceholderText('タスク名を入力...'), '   ');

    expect(screen.getByText('追加')).toBeDisabled();
  });

  it('enables submit button when input has text', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    await user.type(screen.getByPlaceholderText('タスク名を入力...'), 'New Task');

    expect(screen.getByText('追加')).toBeEnabled();
  });

  it('calls onAdd with trimmed name and collapses form on submit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    await user.type(screen.getByPlaceholderText('タスク名を入力...'), '  My New Task  ');
    await user.click(screen.getByText('追加'));

    expect(onAdd).toHaveBeenCalledWith('My New Task');
    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument();
  });

  it('does not call onAdd when submitting empty form', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    // Submit empty form by pressing Enter
    await user.keyboard('{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when submitting whitespace-only input via Enter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    const input = screen.getByPlaceholderText('タスク名を入力...');
    // Type whitespace and then submit by pressing Enter in the input
    await user.type(input, '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
    // Form should remain expanded since submission failed
    expect(input).toBeInTheDocument();
  });

  it('does not call onAdd when form is submitted with empty input via fireEvent', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByText('新しいタスクを追加'));
    const form = screen.getByPlaceholderText('タスク名を入力...').closest('form')!;

    // Directly submit the form with empty input
    fireEvent.submit(form);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
