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
}