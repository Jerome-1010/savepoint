import { useState } from 'react';
import type { Task, SavePointData } from '../types';
import { useModalKeyboard } from '../hooks/useModalKeyboard';
import './Modal.css';

interface CompleteModalProps {
  task: Task;
  onComplete: (data: SavePointData) => void;
  onCancel: () => void;
}

export function CompleteModal({ task, onComplete, onCancel }: CompleteModalProps) {
  const [progress, setProgress] = useState(task.progress);
  const [remaining, setRemaining] = useState(task.remaining);

  const handleConfirm = () => {
    onComplete({ progress, nextStep: '', remaining });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirm();
  };

  useModalKeyboard({ onConfirm: handleConfirm, onCancel });

  return (
    <div className="modal-overlay">
      <div className="modal complete-modal">
        <div className="modal-header">
          <div className="modal-icon">🎉</div>
          <h2>タスク完了</h2>
          <p className="modal-subtitle">「{task.name}」を完了としてマークします</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-icon">📍</span>
              完了時のメモ（任意）
            </label>
            <textarea
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="完了時の状況や成果を記録..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              将来の参考・残課題（任意）
            </label>
            <textarea
              value={remaining}
              onChange={(e) => setRemaining(e.target.value)}
              placeholder="今後のために残しておきたいメモ..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              キャンセル<span className="shortcut-hint" aria-hidden="true">Esc</span>
            </button>
            <button type="submit" className="btn btn-primary">
              完了にする<span className="shortcut-hint" aria-hidden="true">⌘+Enter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
