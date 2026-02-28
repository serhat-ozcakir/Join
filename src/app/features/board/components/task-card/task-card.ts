import { Component, Input } from '@angular/core';
import { Task, TaskPriority } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { avatarColors } from '../../../contacts/components/contact-list/contact-list';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
   @Input({ required: true }) task!: Task;

   get doneSubtasksCount(): number {
    if (!Array.isArray(this.task.subtasks)) {
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

    /**
     * Extracts the first two initials from a full name.
     * @param name - The full name of the contact.
     * @returns Up to two uppercase initials (e.g. "JD" for "John Doe").
     */
    getInitials(name?: string): string {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';
    }
  
    /**
     * Returns a consistent avatar color based on the contact's name.
     * Same name always produces the same color.
     * @param name - The full name of the contact.
     * @returns A hex color string from the predefined avatar color palette.
     */
    getAvatarColor(name?: string): string {
      if (!name) {
        return avatarColors[0];
      }
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % avatarColors.length;
      return avatarColors[index];
    }
}
