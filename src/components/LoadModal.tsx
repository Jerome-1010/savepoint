import type { Task } from '../types';
import './Modal.css';

interface LoadModalProps {
  task: Task;
  onLoad: () => void;
  onCancel: () => void;
}

export function LoadModal({ task, onLoad, onCancel }: LoadModalProps) {
  const hasProgress = task.progress || task.nextStep || task.remaining;
  const lastUpdated = new Date(task.updatedAt).toLocaleString('ja-JP');

  return (
    <div className="modal-overlay">
      <div className="modal load-modal">
        <div className="modal-header">
          <div className="modal-icon">📂</div>
          <h2 className="modal-task-name">{task.name}</h2>
          <p className="modal-subtitle">タスクを再開します</p>
        </div>

        {hasProgress ? (
          <div className="save-data">
            <div className="save-timestamp">
              最終セーブ: {lastUpdated}
            </div>

            {task.progress && (
              <div className="save-section">
                <h3><span className="label-icon">📍</span> 前回の進捗</h3>
                <ul className="save-section-list">
                  {task.progress.split('\n').filter(Boolean).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.nextStep && (
              <div className="save-section highlight">
                <h3><span className="label-icon">➡️</span> 次にやること</h3>
                <ul className="save-section-list">
                  {task.nextStep.split('\n').filter(Boolean).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.remaining && (
              <div className="save-section">
                <h3><span className="label-icon">📝</span> 残タスク</h3>
                <ul className="save-section-list">
                  {task.remaining.split('\n').filter(Boolean).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="no-save-data">
            <p>セーブデータがありません</p>
            <p className="hint">新しく始めましょう</p>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="btn btn-primary" onClick={onLoad}>
            再開する
          </button>
        </div>
      </div>
    </div>
  );
}
