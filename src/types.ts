export type TaskStatus = 'active' | 'paused' | 'completed';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  // セーブポイント情報
  progress: string;      // どこまで進んだか
  nextStep: string;      // 次に予定しているステップ
  remaining: string;     // 残っている課題・後回しにするアクション
}

export interface SavePointData {
  progress: string;
  nextStep: string;
  remaining: string;
}

export interface TaskHistoryEntry {
  id: number;
  taskId: string;
  status: TaskStatus;
  progress: string;
  nextStep: string;
  remaining: string;
  savedAt: number;
}
