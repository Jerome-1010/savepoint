import type { Task } from '../types';
import './ActiveTaskBanner.css';

interface ActiveTaskBannerProps {
  task: Task;
  onPause: () => void;
  onComplete: () => void;
}

export function ActiveTaskBanner({ task, onPause, onComplete }: ActiveTaskBannerProps) {
  return (
    <div className="active-banner">
      <div className="banner-indicator">
        <span className="pulse"></span>
        <span className="banner-label">NOW PLAYING</span>
      </div>
      <div className="banner-content">
        <h2 className="banner-task-name">{task.name}</h2>
        {task.nextStep && (
          <p className="banner-next-step">
            <span className="step-icon">➡️</span>
            {task.nextStep}
          </p>
        )}
      </div>
      <div className="banner-actions">
        <button className="banner-btn pause-btn" onClick={onPause}>
          ⏸️ 中断
        </button>
        <button className="banner-btn complete-btn" onClick={onComplete}>
          ✓ 完了
        </button>
      </div>
    </div>
  );
}
