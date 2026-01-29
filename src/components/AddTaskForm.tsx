import { useState } from 'react';
import './AddTaskForm.css';

interface AddTaskFormProps {
  onAdd: (name: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [name, setName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        className="add-task-trigger"
        onClick={() => setIsExpanded(true)}
        aria-label="新しいタスクを追加"
      >
        <span className="add-icon" aria-hidden="true">+</span>
        <span>新しいタスクを追加</span>
      </button>
    );
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit} role="form" aria-label="タスク追加フォーム">
      <label htmlFor="new-task-input" className="visually-hidden">タスク名</label>
      <input
        id="new-task-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="タスク名を入力..."
        autoFocus
        aria-required="true"
      />
      <div className="form-buttons">
        <button type="button" className="btn-cancel" onClick={() => setIsExpanded(false)}>
          キャンセル
        </button>
        <button type="submit" className="btn-add" disabled={!name.trim()} aria-disabled={!name.trim()}>
          追加
        </button>
      </div>
    </form>
  );
}
