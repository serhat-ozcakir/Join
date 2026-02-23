import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog {
   @Input() task: Task | null = null;     // ✅ [task] binding bununla çalışır
  @Output() closed = new EventEmitter<void>(); // ✅ (closed) bununla çalışır

  close() {
    this.closed.emit();
  }
}
