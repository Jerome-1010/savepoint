import { useState } from 'react';
import type { Task, SavePointData } from '../types';
import './Modal.css';

interface CompleteModalProps {
  task: Task;
  onComplete: (data: SavePointData) => void;
  onCancel: () => void;
}

export function CompleteModal({ task, onComplete, onCancel }: CompleteModalProps) {
  const [progressItems, setProgressItems] = useState<string[]>(
    task.progress ? task.progress.split('\n').filter(Boolean) : ['']
  );
  const [remainingItems, setRemainingItems] = useState<string[]>(
    task.remaining ? task.remaining.split('\n').filter(Boolean) : ['']
  );

  const handleItemChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };
  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };
  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      progress: progressItems.filter(Boolean).join('\n'),
      nextStep: '',
      remaining: remainingItems.filter(Boolean).join('\n'),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal complete-modal">
        <div className="modal-header">
          <div className="modal-icon">🎉</div>
          <h2 className="modal-task-name">{task.name}</h2>
          <p className="modal-subtitle">タスクを完了します</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-icon">📍</span>
              完了時のメモ（任意）
            </label>
            <div className="list-input-group">
              {progressItems.map((item, i) => (
                <div key={i} className="list-input-row">
                  <span className="list-bullet">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(setProgressItems, i, e.target.value)}
                    placeholder="完了時の状況や成果を記録..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddItem(setProgressItems); }
                    }}
                  />
                  <button
                    type="button"
                    className="list-remove-btn"
                    onClick={() => handleRemoveItem(setProgressItems, i)}
                    disabled={progressItems.length === 1}
                  >×</button>
                </div>
              ))}
              <button type="button" className="list-add-btn" onClick={() => handleAddItem(setProgressItems)}>
                + 追加
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              将来の参考・残課題（任意）
            </label>
            <div className="list-input-group">
              {remainingItems.map((item, i) => (
                <div key={i} className="list-input-row">
                  <span className="list-bullet">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(setRemainingItems, i, e.target.value)}
                    placeholder="今後のために残しておきたいメモ..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddItem(setRemainingItems); }
                    }}
                  />
                  <button
                    type="button"
                    className="list-remove-btn"
                    onClick={() => handleRemoveItem(setRemainingItems, i)}
                    disabled={remainingItems.length === 1}
                  >×</button>
                </div>
              ))}
              <button type="button" className="list-add-btn" onClick={() => handleAddItem(setRemainingItems)}>
                + 追加
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              完了にする
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
