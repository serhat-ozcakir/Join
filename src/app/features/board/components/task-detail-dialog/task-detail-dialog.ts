import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority } from '../../models/task.model';
import { Supabase, Contact } from '../../../../supabase';
import { avatarColors } from '../../../contacts/components/contact-list/contact-list';

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog implements OnInit {
  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();

  supabase = inject(Supabase);

  isClosing = signal(false);
  isEditMode = signal(false);
  dropdownOpen = signal(false);
  selectedContacts = signal<Contact[]>([]);
  selectedPriority = signal<TaskPriority | null>(null);

  enterEditMode() {
    this.isEditMode.set(true);
    this.selectedPriority.set(this.task?.priority ?? null);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  ngOnInit() {
    this.supabase.getContacts();
  }

  close() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.closed.emit();
    }, 400);
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  isSelected(contact: Contact): boolean {
    return this.selectedContacts().some(c => c.id === contact.id);
  }

  toggleContact(contact: Contact) {
    if (this.isSelected(contact)) {
      this.selectedContacts.set(this.selectedContacts().filter(c => c.id !== contact.id));
    } else {
      this.selectedContacts.set([...this.selectedContacts(), contact]);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.assigned-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }
}
