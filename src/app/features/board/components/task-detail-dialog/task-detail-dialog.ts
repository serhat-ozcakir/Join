import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
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
  searchText = signal('');

  filteredContacts = computed(() => {
    const search = this.searchText().toLowerCase();
    if (!search) return this.supabase.contacts();
    return this.supabase.contacts().filter(c => c.name.toLowerCase().includes(search));
  });

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

  onSearchInput(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.dropdownOpen.set(true);
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

  onCardClick(event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (!target.closest('.assigned-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }
}
