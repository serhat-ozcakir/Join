import { Injectable } from '@angular/core';
import { Task, Status, TaskPriority, TaskType } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private tasks: Task[] = [
     {
      id: '1',
      title: 'Login page design',
      description: 'Create login UI and basic validation',
      status: 'todo',
      type: 'User Story',
      priority: 'medium',
      assignees: [{ id: 'u1', initials: 'AM' }],
      subtasks: [
        { id: 's1', title: 'Design layout', done: false },
        { id: 's2', title: 'Add validations', done: false },
      ],
      createdAt: new Date().toISOString(),
      dueDate: undefined,
    },
    {
      id: '2',
      title: 'API integration',
      description: 'Connect tasks endpoint',
      status: 'inProgress',
      type: 'Technical Task',
      priority: 'urgent',
      assignees: [{ id: 'u2', initials: 'MB' }],
      subtasks: [{ id: 's3', title: 'Implement service', done: true }],
      createdAt: new Date().toISOString(),
    },
  ];

  // Method to get all tasks
  getTasks(): Task[] {
    return this.tasks;
  }

  // Method to add a new task
  addTask(data:{
    title: string;
    description?: string;
    status: Status; 
    type: TaskType;
    priority: TaskPriority;
    assignees?: { id: string; initials: string; name?: string }[];
    subtasks?: { id: string; title: string; done: boolean }[];
    dueDate?: string;
  }):void {
    const newTask: Task = {
      id: Date.now().toString(), 
      title: data.title,
      description: data.description,
      status: data.status,
      type: data.type,
      priority: data.priority,
      assignees: data.assignees ?? [],
      subtasks: data.subtasks ?? [],
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
    };
    this.tasks.push(newTask);
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  }
}