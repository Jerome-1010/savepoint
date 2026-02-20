import { useEffect, useState } from 'react';
import type { Task, TaskHistoryEntry } from '../types';
import './TaskHistoryModal.css';

interface TaskHistoryModalProps {
  task: Task;
  fetchHistory: (taskId: string) => Promise<TaskHistoryEntry[]>;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: '進行中',
  paused: '中断',
  completed: '完了',
};

const STATUS_ICON: Record<string, string> = {
  active: '▶️',
  paused: '⏸️',
  completed: '✅',
};

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TaskHistoryModal({ task, fetchHistory, onClose }: TaskHistoryModalProps) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchHistory(task.id).then((entries) => {
      if (!cancelled) {
        setHistory(entries);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [task.id, fetchHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">📜</div>
          <h2>更新履歴</h2>
          <p className="modal-subtitle">{task.name}</p>
        </div>

        {isLoading ? (
          <div className="history-loading">読み込み中...</div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <p>まだ更新履歴がありません</p>
          </div>
        ) : (
          <div className="history-tree">
            {history.map((entry, index) => (
              <div key={entry.id} className="history-tree-node">
                <div className="history-tree-line-container">
                  <div className="history-tree-dot" />
                  {index < history.length - 1 && <div className="history-tree-line" />}
                </div>
                <div className="history-entry">
                  <div className="history-entry-header">
                    <span className="history-status-icon">{STATUS_ICON[entry.status] ?? '⏸️'}</span>
                    <span className="history-status-label">{STATUS_LABEL[entry.status] ?? entry.status}</span>
                    <span className="history-timestamp">{formatDateTime(entry.savedAt)}</span>
                  </div>
                  {(entry.progress || entry.nextStep || entry.remaining) && (
                    <div className="history-entry-body">
                      {entry.progress && (
                        <div className="save-section">
                          <h3>どこまで進んだか</h3>
                          <p>{entry.progress}</p>
                        </div>
                      )}
                      {entry.nextStep && (
                        <div className="save-section highlight">
                          <h3>次のステップ</h3>
                          <p>{entry.nextStep}</p>
                        </div>
                      )}
                      {entry.remaining && (
                        <div className="save-section">
                          <h3>残っている課題</h3>
                          <p>{entry.remaining}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
