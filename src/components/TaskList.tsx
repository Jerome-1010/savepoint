import type { Task } from '../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelect: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onHistory: (task: Task) => void;
}

export function TaskList({ tasks, activeTaskId, onSelect, onComplete, onDelete, onHistory }: TaskListProps) {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const getStatusIcon = (task: Task) => {
    if (task.id === activeTaskId) return '▶️';
    if (task.status === 'completed') return '✅';
    if (task.status === 'paused') return '⏸️';
    return '⏸️';
  };

  const getStatusLabel = (task: Task) => {
    if (task.id === activeTaskId) return '進行中';
    if (task.status === 'completed') return '完了';
    return '中断';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className={`task-item ${task.id === activeTaskId ? 'active' : ''} ${task.status}`}
    >
      <div className="task-main" onClick={() => task.status !== 'completed' && onSelect(task)}>
        <span className="task-status-icon">{getStatusIcon(task)}</span>
        <div className="task-info">
          <span className="task-name">{task.name}</span>
          {task.nextStep && task.status !== 'completed' && (
            <span className="task-next-hint">次: {task.nextStep.slice(0, 30)}...</span>
          )}
        </div>
        <div className="task-meta">
          <span className="task-status-label">{getStatusLabel(task)}</span>
          <span className="task-date">{formatDate(task.updatedAt)}</span>
        </div>
      </div>
      <div className="task-actions">
        {task.status !== 'completed' && (
          <button
            className="task-btn complete-btn"
            onClick={(e) => { e.stopPropagation(); onComplete(task); }}
            title="完了にする"
          >
            ✓
          </button>
        )}
        <button
          className="task-btn history-btn"
          onClick={(e) => { e.stopPropagation(); onHistory(task); }}
          title="更新履歴"
        >
          📜
        </button>
        <button
          className="task-btn delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          title="削除"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="task-list">
      {activeTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title">タスク</h3>
          {activeTasks.map(renderTask)}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section completed-section">
          <h3 className="section-title">完了済み</h3>
          {completedTasks.map(renderTask)}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>タスクがありません</p>
          <p className="empty-hint">新しいタスクを追加してください</p>
        </div>
      )}
    </div>
  );
}
