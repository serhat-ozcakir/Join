import { Component, Input } from '@angular/core';
import { Task, TaskPriority } from '../../models/task.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
   @Input({ required: true }) task!: Task;

   get doneSubtasksCount(): number {
    if (!this.task.subtasks) {
      return 0;
    }
    return this.task.subtasks.filter(sub => sub.done).length;
  }

  get totalSubtasksCount(): number {
    return this.task.subtasks ? this.task.subtasks.length : 0;
  }

  priorityIcon:Record<TaskPriority, string> = {
    high: 'assets/icons/prio-high.png',
    medium: 'assets/icons/prio-medium.png',
    low: 'assets/icons/prio-low.png'
  }
}
