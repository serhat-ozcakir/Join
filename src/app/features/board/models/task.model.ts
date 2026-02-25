
// task.model.ts
export type Status = 'todo' | 'inProgress' | 'awaitFeedback' | 'done';
export type TaskType = 'User Story' | 'Technical Task';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Assignee {
  id: string;
  initials: string;
  name?: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// Individuelle Namen vergeben(Wenn export)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  type: TaskType;
  priority: TaskPriority;
  assignees?: Assignee[];
  subtasks?: Subtask[];
  createdAt: string;
  dueDate?: string;
}
