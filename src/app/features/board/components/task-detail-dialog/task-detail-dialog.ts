import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskPriority } from '../../models/task.model';
import { Supabase, Contact } from '../../../../supabase';
import { avatarColors } from '../../../contacts/components/contact-list/contact-list';
import { TaskStore } from '../../services/task-store';

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog implements OnInit {
  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  supabase = inject(Supabase);
  taskStore = inject(TaskStore);

  constructor() {
    effect(() => {
      if (this.dropdownOpen()) {
        setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 0);
      }
    });
  }

  isClosing = signal(false);
  isEditMode = signal(false);
  dropdownOpen = signal(false);
  saving = signal(false);
  selectedContacts = signal<Contact[]>([]);
  selectedPriority = signal<TaskPriority | null>(null);
  searchText = signal('');
  editDueDate = signal('');
  newSubtaskTitle = '';
  editingSubtaskId = signal<string | null>(null);
  editingSubtaskTitle = '';

  filteredContacts = computed(() => {
    const search = this.searchText().toLowerCase();
    if (!search) return this.supabase.contacts();
    return this.supabase.contacts().filter(c => c.name.toLowerCase().includes(search));
  });

  enterEditMode() {
    this.isEditMode.set(true);
    this.selectedPriority.set(this.task?.priority ?? null);
    this.editDueDate.set(this.task?.dueDate ?? '');
    const preSelected = this.supabase.contacts().filter(c =>
      this.task?.assignees?.some(a => a.id === c.id)
    );
    this.selectedContacts.set(preSelected);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  async saveEdit(title: string, description: string, dueDate: string) {
    if (!this.task?.id) return;
    this.saving.set(true);
    const assignees = this.selectedContacts().map(c => ({
      id: c.id!,
      initials: this.getInitials(c.name),
      name: c.name,
    }));
    await this.taskStore.updateTask(this.task.id, {
      title,
      description,
      dueDate,
      priority: this.selectedPriority() ?? this.task.priority,
      assignees,
    });
    this.saving.set(false);
    this.isEditMode.set(false);
    this.taskUpdated.emit();
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
      this.selectedContacts.set(this.selectedContacts().filter(contacts => contacts.id !== contact.id));
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

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  onDateChange(input: HTMLInputElement) {
    if (input.value && input.value < this.today) {
      input.value = this.today;
    }
    this.editDueDate.set(input.value);
  }

  onCardClick(event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (!target.closest('.assigned-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }

  async deleteTask() {
    if(!this.task?.id) return;
    await this.taskStore.deleteTask(this.task.id);
    this.closed.emit();
}

async toggleSubtask(subtaskId: string, done: boolean) {
  if (!this.task) return;
  const updatedSubtasks = this.task.subtasks!.map(sub =>
    sub.id === subtaskId ? { ...sub, done } : sub
  );
  const taskId = this.task.id;
  this.task = { ...this.task, subtasks: updatedSubtasks };
  await this.taskStore.updateTask(taskId, { subtasks: updatedSubtasks });
}

onSubtaskChange(subtaskId: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.toggleSubtask(subtaskId, checked);
}

 async addSubtask() {
  if (!this.newSubtaskTitle.trim() || !this.task) return;
  const newSubtask = {
    id: crypto.randomUUID(),
    title: this.newSubtaskTitle.trim(),
    done: false
  };
  const updatedSubtasks = [...(this.task.subtasks ?? []), newSubtask];
  this.task = { ...this.task, subtasks: updatedSubtasks };
  this.newSubtaskTitle = '';
  await this.taskStore.updateTask(this.task.id, { subtasks: updatedSubtasks });
}

async removeSubtask(subtaskId: string) {
  if (!this.task) return;
  const taskId = this.task.id;
  const updatedSubtasks = (this.task.subtasks ?? []).filter(subtask => subtask.id !== subtaskId);
  this.task = { ...this.task, subtasks: updatedSubtasks };
  await this.taskStore.updateTask(taskId, { subtasks: updatedSubtasks });

}

openEditForm(subtaskId: string) {
  if (!this.task) return;
  const subtask = this.task.subtasks?.find(subtask => subtask.id === subtaskId);
  if (!subtask) return;
  this.editingSubtaskId.set(subtaskId);
  this.editingSubtaskTitle = subtask.title;
}

async saveSubtaskEdit() {
  if (!this.task || !this.editingSubtaskId() || !this.editingSubtaskTitle.trim()) return;
  const taskId = this.task.id;
  const updatedSubtasks = (this.task.subtasks ?? []).map(subtask =>
    subtask.id === this.editingSubtaskId()
      ? { ...subtask, title: this.editingSubtaskTitle.trim() }
      : subtask
  );
  this.task = { ...this.task, subtasks: updatedSubtasks };
  this.editingSubtaskId.set(null);
  await this.taskStore.updateTask(taskId, { subtasks: updatedSubtasks });
}

cancelSubtaskEdit() {
  this.editingSubtaskId.set(null);
}
}

