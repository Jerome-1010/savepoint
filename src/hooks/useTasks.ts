import { useState, useEffect, useCallback } from 'react';
import type { Task, SavePointData } from '../types';

const API_BASE = '/api/tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: Task[] = await res.json();
      setTasks(data);

      // アクティブなタスクを検出
      const active = data.find((t) => t.status === 'active');
      setActiveTaskId(active?.id ?? null);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (name: string) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const newTask: Task = await res.json();
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updatedTask: Task = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((task) => task.id !== id));
      if (activeTaskId === id) {
        setActiveTaskId(null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [activeTaskId]);

  const saveAndSwitch = useCallback(async (
    currentTaskId: string | null,
    saveData: SavePointData,
    nextTaskId: string | null
  ) => {
    // 現在のタスクをセーブして中断
    if (currentTaskId) {
      await updateTask(currentTaskId, {
        ...saveData,
        status: 'paused',
      });
    }

    // 次のタスクをアクティブに
    if (nextTaskId) {
      await updateTask(nextTaskId, { status: 'active' });
    }

    setActiveTaskId(nextTaskId);
  }, [updateTask]);

  const completeTask = useCallback(async (id: string, saveData: SavePointData) => {
    await updateTask(id, {
      ...saveData,
      status: 'completed',
    });
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  }, [updateTask, activeTaskId]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  return {
    tasks,
    activeTask,
    activeTaskId,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    saveAndSwitch,
    completeTask,
  };
}
