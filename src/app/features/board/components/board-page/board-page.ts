import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task , Status} from '../../models/task.model';
import { BoardColumn } from '../../components/board-column/board-column';
import { TaskDetailDialog } from '../../components/task-detail-dialog/task-detail-dialog';
import { AddTaskDialog } from '../../../add-task/components/add-task-dialog/add-task-dialog';
import { TaskStore } from '../../services/task-store';

@Component({
  selector: 'app-board-page',
  imports: [BoardColumn, TaskDetailDialog, AddTaskDialog, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
})
export class BoardPage implements OnInit {
  private taskStore = inject(TaskStore);

  dropListIds: string[] = ['todo', 'inProgress', 'awaitFeedback', 'done'];

  searchQuery = '';

  columns: Array<{ title: string; status: Status; tasks: Task[] }> = [
    { title: 'To do', status: 'todo', tasks: [] },
    { title: 'In progress', status: 'inProgress', tasks: [] },
    { title: 'Await feedback', status: 'awaitFeedback', tasks: [] },
    { title: 'Done', status: 'done', tasks: [] }
  ];

  isLoading = false;
  error: string | null = null;

  showTaskDetail = false;
  showAddTask = false;
  selectedTask: Task | null = null;
  selectedStatus: Status | null = null;

  constructor() {
    effect(() => {
      const allTasks = this.taskStore.tasks();
      this.filterTasks(allTasks);
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await this.taskStore.loadTasks();
    } catch (error: any) {
      this.error = `Failed to load tasks: ${error.message}`;
      console.error('Error loading tasks:', error);
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 0);
    }
  }

  filterTasks(allTasks: Task[]): void {
    const query = this.searchQuery.toLowerCase().trim();

    let filteredTasks = allTasks;

    if (query.length >= 3) {
      filteredTasks = allTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    this.columns.forEach(col => {
      col.tasks = filteredTasks.filter(t => t.status === col.status);
    });
  }

  onSearchChange(): void {
    const allTasks = this.taskStore.tasks();
    this.filterTasks(allTasks);
  }

  openAddTaskDialog(): void {
    this.selectedStatus = 'todo';
    this.showAddTask = true;
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetail = true;
  }

  closeTaskDetail(): void {
    this.showTaskDetail = false;
    this.selectedTask = null;
  }

  onTaskUpdated(): void {
    this.closeTaskDetail();
  }

  addTask(status: Status): void {
    this.selectedStatus = status;
    this.showAddTask = true;
  }

  closeAddTask(): void {
    this.showAddTask = false;
    this.selectedStatus = null;
  }

  onTaskCreated(): void {
    this.closeAddTask();
  }

  async onTaskDropped(event: { task: Task; newStatus: Status }): Promise<void> {
    await this.taskStore.updateTask(event.task.id, { status: event.newStatus });
  }
}
