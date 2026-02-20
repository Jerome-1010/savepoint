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
  const [progressItems, setProgressItems] = useState<string[]>(
    task.progress ? task.progress.split('\n').filter(Boolean) : ['']
  );
  const [nextStepItems, setNextStepItems] = useState<string[]>(
    task.nextStep ? task.nextStep.split('\n').filter(Boolean) : ['']
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
    onSave({
      progress: progressItems.filter(Boolean).join('\n'),
      nextStep: nextStepItems.filter(Boolean).join('\n'),
      remaining: remainingItems.filter(Boolean).join('\n'),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal save-modal">
        <div className="modal-header">
          <div className="modal-icon">💾</div>
          <h2 className="modal-task-name">{task.name}</h2>
          <p className="modal-subtitle">進捗を保存します</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-icon">📍</span>
              どこまで進んだ？
            </label>
            <div className="list-input-group">
              {progressItems.map((item, i) => (
                <div key={i} className="list-input-row">
                  <span className="list-bullet">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(setProgressItems, i, e.target.value)}
                    placeholder="進捗を入力..."
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
              <span className="label-icon">➡️</span>
              次にやること
            </label>
            <div className="list-input-group">
              {nextStepItems.map((item, i) => (
                <div key={i} className="list-input-row">
                  <span className="list-bullet">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(setNextStepItems, i, e.target.value)}
                    placeholder="次のステップを入力..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAddItem(setNextStepItems); }
                    }}
                  />
                  <button
                    type="button"
                    className="list-remove-btn"
                    onClick={() => handleRemoveItem(setNextStepItems, i)}
                    disabled={nextStepItems.length === 1}
                  >×</button>
                </div>
              ))}
              <button type="button" className="list-add-btn" onClick={() => handleAddItem(setNextStepItems)}>
                + 追加
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              残タスク・後回しにすること
            </label>
            <div className="list-input-group">
              {remainingItems.map((item, i) => (
                <div key={i} className="list-input-row">
                  <span className="list-bullet">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(setRemainingItems, i, e.target.value)}
                    placeholder="残タスクを入力..."
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
              {nextTask ? `保存して「${nextTask.name}」へ` : '保存して終了'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
