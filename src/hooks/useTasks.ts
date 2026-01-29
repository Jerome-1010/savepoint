import { useCallback, useMemo } from 'react';
import type { Task, SavePointData } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface UseTasksOptions {
  onStorageError?: (error: Error) => void;
}

export function useTasks(options?: UseTasksOptions) {
  const storageOptions = useMemo(() => ({
    onError: (error: Error) => options?.onStorageError?.(error),
  }), [options]);

  const [tasks, setTasks] = useLocalStorage<Task[]>('savepoint-tasks', [], storageOptions);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('savepoint-active', null, storageOptions);

  const generateId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addTask = useCallback((name: string) => {
    const newTask: Task = {
      id: generateId(),
      name,
      status: 'paused',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progress: '',
      nextStep: '',
      remaining: '',
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: Date.now() }
          : task
      )
    );
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  }, [setTasks, activeTaskId, setActiveTaskId]);

  const saveAndSwitch = useCallback((
    currentTaskId: string | null,
    saveData: SavePointData,
    nextTaskId: string | null
  ) => {
    // 現在のタスクをセーブして中断
    if (currentTaskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentTaskId
            ? {
                ...task,
                ...saveData,
                status: 'paused' as const,
                updatedAt: Date.now(),
              }
            : task
        )
      );
    }

    // 次のタスクをアクティブに
    if (nextTaskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === nextTaskId
            ? { ...task, status: 'active' as const, updatedAt: Date.now() }
            : task
        )
      );
    }

    setActiveTaskId(nextTaskId);
  }, [setTasks, setActiveTaskId]);

  const completeTask = useCallback((id: string, saveData: SavePointData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...saveData,
              status: 'completed' as const,
              updatedAt: Date.now(),
            }
          : task
      )
    );
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  }, [setTasks, activeTaskId, setActiveTaskId]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  return {
    tasks,
    activeTask,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    saveAndSwitch,
    completeTask,
  };
}
