import { useState } from 'react';
import type { Task, SavePointData } from '../types';
import './Modal.css';

interface SaveModalProps {
  task: Task;
  nextTask: Task | null;
  onSave: (data: SavePointData) => void;
  onCancel: () => void;
  subtitle?: string;
  saveLabel?: string;
}

export function SaveModal({ task, nextTask, onSave, onCancel, subtitle, saveLabel }: SaveModalProps) {
  const [progress, setProgress] = useState(task.progress);
  const [nextStep, setNextStep] = useState(task.nextStep);
  const [remaining, setRemaining] = useState(task.remaining);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ progress, nextStep, remaining });
  };

  return (
    <div className="modal-overlay">
      <div className="modal save-modal">
        <div className="modal-header">
          <div className="modal-icon">💾</div>
          <h2>セーブポイント</h2>
          <p className="modal-subtitle">
            {subtitle ?? `「${task.name}」の進捗を保存します`}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-icon">📍</span>
              どこまで進んだ？
            </label>
            <textarea
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="現在の進捗状況を記録..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">➡️</span>
              次にやること
            </label>
            <textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="再開時に最初にやることを記録..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              残タスク・後回しにすること
            </label>
            <textarea
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
              {saveLabel ?? (nextTask ? `保存して「${nextTask.name}」へ` : '保存して終了')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
