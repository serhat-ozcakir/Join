import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from '../../services/task-store';
import { Task } from '../../models/task.model';
import { BoardColumn } from '../../components/board-column/board-column';
import { TaskDetailDialog } from '../../components/task-detail-dialog/task-detail-dialog';
import { AddTaskDialog } from '../../../add-task/components/add-task-dialog/add-task-dialog';

/** Kanban board page for managing tasks across different status columns. */
@Component({
  selector: 'app-board-page',
  imports: [BoardColumn, TaskDetailDialog, AddTaskDialog, CommonModule],
  standalone: true,
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
})
export class BoardPage implements OnInit {
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  awaitFeedbackTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);

  // Dialog state
  selectedTask: Task | null = null;
  showAddTaskDialog = false;

  constructor(private taskStore: TaskStore) {}

  ngOnInit() {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    const tasks = await this.taskStore.getTasks();
    this.todoTasks.set(tasks.filter(task => task.status === 'todo'));
    this.inProgressTasks.set(tasks.filter(task => task.status === 'inProgress'));
    this.awaitFeedbackTasks.set(tasks.filter(task => task.status === 'awaitFeedback'));
    this.doneTasks.set(tasks.filter(task => task.status === 'done'));
  }

  openTaskDetail(task: Task): void {
    this.selectedTask = task;
  }

  async closeDetailDialog(): Promise<void> {
    this.selectedTask = null;
    await this.loadTasks();
  }

  openAddTaskDialog(): void {
    this.showAddTaskDialog = true;
  }

  async closeAddTaskDialog(): Promise<void> {
    this.showAddTaskDialog = false;
    await this.loadTasks();
  }
}
