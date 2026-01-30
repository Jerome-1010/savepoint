import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveTaskBanner } from './ActiveTaskBanner';
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

describe('ActiveTaskBanner', () => {
  it('renders task name and NOW PLAYING label', () => {
    const task = createTask({ name: 'My Task' });
    const onPause = vi.fn();
    const onComplete = vi.fn();

    render(<ActiveTaskBanner task={task} onPause={onPause} onComplete={onComplete} />);

    expect(screen.getByText('NOW PLAYING')).toBeInTheDocument();
    expect(screen.getByText('My Task')).toBeInTheDocument();
  });

  it('renders next step when provided', () => {
    const task = createTask({ nextStep: 'Do something next' });
    const onPause = vi.fn();
    const onComplete = vi.fn();

    render(<ActiveTaskBanner task={task} onPause={onPause} onComplete={onComplete} />);

    expect(screen.getByText('Do something next')).toBeInTheDocument();
  });

  it('does not render next step when not provided', () => {
    const task = createTask({ nextStep: '' });
    const onPause = vi.fn();
    const onComplete = vi.fn();

    render(<ActiveTaskBanner task={task} onPause={onPause} onComplete={onComplete} />);

    expect(screen.queryByText('➡️')).not.toBeInTheDocument();
  });

  it('calls onPause when pause button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onPause = vi.fn();
    const onComplete = vi.fn();

    render(<ActiveTaskBanner task={task} onPause={onPause} onComplete={onComplete} />);

    await user.click(screen.getByText('⏸️ 中断'));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when complete button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onPause = vi.fn();
    const onComplete = vi.fn();

    render(<ActiveTaskBanner task={task} onPause={onPause} onComplete={onComplete} />);

    await user.click(screen.getByText('✓ 完了'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
