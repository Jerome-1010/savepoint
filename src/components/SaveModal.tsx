import { useState } from 'react';
import type { Task, SavePointData } from '../types';
import './Modal.css';

interface SaveModalProps {
  task: Task;
  nextTask: Task | null;
  onSave: (data: SavePointData) => void;
  onCancel: () => void;
}

export function SaveModal({ task, nextTask, onSave, onCancel }: SaveModalProps) {
  const [progress, setProgress] = useState(task.progress);
  const [nextStep, setNextStep] = useState(task.nextStep);
  const [remaining, setRemaining] = useState(task.remaining);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ progress, nextStep, remaining });
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal save-modal" role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
        <div className="modal-header">
          <div className="modal-icon" aria-hidden="true">💾</div>
          <h2 id="save-modal-title">セーブポイント</h2>
          <p className="modal-subtitle">「{task.name}」の進捗を保存します</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="save-progress">
              <span className="label-icon" aria-hidden="true">📍</span>
              どこまで進んだ？
            </label>
            <textarea
              id="save-progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="現在の進捗状況を記録..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="save-next-step">
              <span className="label-icon" aria-hidden="true">➡️</span>
              次にやること
            </label>
            <textarea
              id="save-next-step"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="再開時に最初にやることを記録..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="save-remaining">
              <span className="label-icon" aria-hidden="true">📝</span>
              残タスク・後回しにすること
            </label>
            <textarea
              id="save-remaining"
              value={remaining}
              onChange={(e) => setRemaining(e.target.value)}
              placeholder="忘れないようにメモ..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {nextTask ? `保存して「${nextTask.name}」へ` : '保存して終了'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
