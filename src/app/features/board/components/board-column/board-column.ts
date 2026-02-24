import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  @Input() title = '';
  @Input() tasks: Task[] = [];

  @Output() taskSelected = new EventEmitter<Task>();
  @Output() addClicked = new EventEmitter<void>();

  onTaskSelected(task: Task): void {
    this.taskSelected.emit(task);
  }

  onAddTask(): void {
    this.addClicked.emit();
    console.log('working');
  }

  getemptyMessage(): string {
    if (this.tasks.length === 0) {
      return `No tasks  ${this.title}`;
    }
    return '';
  }

  // Methode nur zum erstellen des Dialogs, wird später entfernt
  onTestOpenDialog(): void {
    const dummyTask: Task = {
      id: 'test',
      title: 'Test Task',
      status: 'todo',
      type: 'User Story',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    this.taskSelected.emit(dummyTask);
  }
}
