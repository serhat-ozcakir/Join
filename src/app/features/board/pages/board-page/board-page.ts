import { Component } from '@angular/core';
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
export class BoardPage {
  // Colon lists for each task status
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  awaitFeedbackTasks: Task[] = [];
  doneTasks: Task[] = [];

  // Dialog state
  selectedTask: Task | null = null;
  showAddTaskDialog = false;

  constructor(private taskStore: TaskStore) {
    this.loadTasks();
  }
 // Method to load tasks from the store and categorize them by status
  loadTasks(): void {
    const tasks = this.taskStore.getTasks();
    this.todoTasks = tasks.filter(task => task.status === 'todo');
    this.inProgressTasks = tasks.filter(task => task.status === 'inProgress');
    this.awaitFeedbackTasks = tasks.filter(task => task.status === 'awaitFeedback');
    this.doneTasks = tasks.filter(task => task.status === 'done');
  }

  // when a task is clicked, open the detail dialog
  openTaskDetail(task: Task): void {
    this.selectedTask = task;
      console.log('DETAIL', task);
  }
 // Close the task detail dialog
  closeDetailDialog(): void {
    this.selectedTask = null;
  }

  // Add Task modal
  openAddTaskDialog(): void {
    this.showAddTaskDialog = true;
    console.log('ADD');
  }

  // Close the add task dialog and refresh the task lists
  closeAddTaskDialog(): void {
    this.showAddTaskDialog = false;
    this.loadTasks();
  }
}
