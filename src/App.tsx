import { useState } from 'react';
import type { Task, SavePointData } from './types';
import { useTasks } from './hooks/useTasks';
import {
  SaveModal,
  LoadModal,
  CompleteModal,
  TaskList,
  AddTaskForm,
  ActiveTaskBanner,
  IssueReporter,
} from './components';
import './App.css';

type ModalState =
  | { type: 'none' }
  | { type: 'save'; nextTask: Task | null }
  | { type: 'load'; task: Task }
  | { type: 'complete'; task: Task };

function App() {
  const {
    tasks,
    activeTask,
    activeTaskId,
    addTask,
    deleteTask,
    saveAndSwitch,
    completeTask,
  } = useTasks();

  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const handleSelectTask = (task: Task) => {
    if (task.id === activeTaskId) return;

    // アクティブなタスクがある場合はセーブ画面を表示
    if (activeTask) {
      setModal({ type: 'save', nextTask: task });
    } else {
      // アクティブなタスクがない場合はロード画面を表示
      setModal({ type: 'load', task });
    }
  };

  const handlePauseActive = () => {
    if (activeTask) {
      setModal({ type: 'save', nextTask: null });
    }
  };

  const handleCompleteTask = (task: Task) => {
    setModal({ type: 'complete', task });
  };

  const handleSave = (data: SavePointData) => {
    if (modal.type === 'save') {
      const nextTask = modal.nextTask;
      saveAndSwitch(activeTaskId, data, nextTask?.id || null);

      // 次のタスクがある場合はロード画面を表示
      if (nextTask) {
        setModal({ type: 'load', task: nextTask });
      } else {
        setModal({ type: 'none' });
      }
    }
  };

  const handleLoad = () => {
    if (modal.type === 'load') {
      saveAndSwitch(null, { progress: '', nextStep: '', remaining: '' }, modal.task.id);
      setModal({ type: 'none' });
    }
  };

  const handleComplete = (data: SavePointData) => {
    if (modal.type === 'complete') {
      completeTask(modal.task.id, data);
      setModal({ type: 'none' });
    }
  };

  const handleDelete = (task: Task) => {
    if (confirm(`「${task.name}」を削除しますか？`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="logo-icon">💾</span>
          セーブポイント
        </h1>
        <p className="tagline">タスク切り替えのコンテキストを保存</p>
      </header>

      <main className="app-main">
        {activeTask && (
          <ActiveTaskBanner
            task={activeTask}
            onPause={handlePauseActive}
            onComplete={() => handleCompleteTask(activeTask)}
          />
        )}

        <AddTaskForm onAdd={addTask} />

        <div className="task-list-container">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSelect={handleSelectTask}
            onComplete={handleCompleteTask}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {modal.type === 'save' && activeTask && (
        <SaveModal
          task={activeTask}
          nextTask={modal.nextTask}
          onSave={handleSave}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'load' && (
        <LoadModal
          task={modal.task}
          onLoad={handleLoad}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'complete' && (
        <CompleteModal
          task={modal.task}
          onComplete={handleComplete}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      <IssueReporter />
    </div>
  );
}

export default App;
