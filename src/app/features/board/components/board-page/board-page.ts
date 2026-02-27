import { Component, OnInit, inject, ChangeDetectorRef, effect } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  dropListIds: string[] = ['todo', 'inProgress', 'awaitFeedback', 'done'];

  searchQuery = '';
  allTasks: Task[] = [];

  columns: Array<{ title: string; status: Status; tasks: Task[] }> = [
    { title: 'To do', status: 'todo', tasks: [] },
    { title: 'In progress', status: 'inProgress', tasks: [] },
    { title: 'Await feedback', status: 'awaitFeedback', tasks: [] },
    { title: 'Done', status: 'done', tasks: [] }
  ];

  isLoading = true;
  error: string | null = null;

  showTaskDetail = false;
  showAddTask = false;
  selectedTask: Task | null = null;
  selectedStatus: Status | null = null;

  constructor() {
    effect(() => {
      const updatedTasks = this.taskStore.tasks();

      if (updatedTasks.length > 0) {
        this.allTasks = updatedTasks;
        this.filterTasks(this.allTasks);

        if (this.selectedTask) {
          const updatedSelectedTask = updatedTasks.find(t => t.id === this.selectedTask!.id);
          if (updatedSelectedTask) {
            this.selectedTask = updatedSelectedTask;
          }
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.error = null;

    try {
      this.allTasks = await this.taskStore.getTasks();
      this.filterTasks(this.allTasks);
    } catch (error: any) {
      this.error = `Failed to load tasks: ${error.message}`;
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  filterTasks(allTasks: Task[]): void {
    const query = this.searchQuery.toLowerCase().trim();

    let filteredTasks = allTasks;

    if (query.length >= 1) {
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
    this.filterTasks(this.allTasks);
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

  async onTaskUpdated(): Promise<void> {
 this.closeTaskDetail();
    await this.taskStore.loadTasks();


  }

  addTask(status: Status): void {
    this.selectedStatus = status;
    this.showAddTask = true;
    this.cdr.detectChanges();
  }

  closeAddTask(): void {
    this.showAddTask = false;
    this.selectedStatus = null;
  }

  async onTaskCreated(): Promise<void> {
    this.closeAddTask();
    await this.taskStore.loadTasks();
    this.cdr.detectChanges();
  }

async onTaskDropped(event: { task: Task; newStatus: Status }): Promise<void> {
  await this.taskStore.updateTask(event.task.id, { status: event.newStatus });
}
}
