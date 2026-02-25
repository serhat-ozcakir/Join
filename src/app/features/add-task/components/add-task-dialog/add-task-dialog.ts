import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { Supabase, Contact } from '../../../../supabase';
import { TaskStore } from '../../../board/services/task-store';
import { Status, TaskPriority, TaskType } from '../../../board/models/task.model';

@Component({
  selector: 'app-add-task-dialog',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true,
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog implements OnInit {
  @Output() closed = new EventEmitter<void>();

  taskForm: FormGroup;
  contacts: Contact[] = [];
  newSubtaskTitle = '';
  isSubmitting = false;

  priorities: TaskPriority[] = ['high', 'medium', 'low'];
  types: TaskType[] = ['User Story', 'Technical Task'];

  constructor(
    private fb: FormBuilder,
    private supabase: Supabase,
    private taskStore: TaskStore
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assignedTo: [[]],
      dueDate: [''],
      priority: ['medium', Validators.required],
      type: ['Technical Task', Validators.required],
      subtasks: this.fb.array([])
    });
  }

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    await this.supabase.getContacts();
    this.contacts = this.supabase.contacts();
  }

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.subtasks.push(
        this.fb.group({
          id: [crypto.randomUUID()],
          title: [this.newSubtaskTitle.trim()],
          done: [false]
        })
      );
      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number) {
    this.subtasks.removeAt(index);
  }

  toggleContact(contactId: string) {
    const current = this.taskForm.value.assignedTo || [];
    const index = current.indexOf(contactId);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(contactId);
    }

    this.taskForm.patchValue({ assignedTo: [...current] });
  }

  isContactSelected(contactId: string): boolean {
    return (this.taskForm.value.assignedTo || []).includes(contactId);
  }

  getContactInitials(contact: Contact): string {
    return contact.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  async onSubmit() {
    if (this.taskForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.taskForm.value;

    // Map selected contact IDs to assignee objects
    const assignees = (formValue.assignedTo || []).map((contactId: string) => {
      const contact = this.contacts.find(c => c.id === contactId);
      return contact ? {
        id: contact.id!,
        initials: this.getContactInitials(contact),
        name: contact.name
      } : null;
    }).filter((a: any) => a !== null);

    const taskData = {
      title: formValue.title,
      description: formValue.description || undefined,
      status: 'todo' as Status,
      type: formValue.type,
      priority: formValue.priority,
      assignees,
      subtasks: formValue.subtasks || [],
      dueDate: formValue.dueDate || undefined
    };

    try {
      await this.taskStore.addTask(taskData);
      this.close();
    } catch (error) {
      console.error('Error creating task:', error);
      this.isSubmitting = false;
    }
  }

  clearForm() {
    this.taskForm.reset({
      priority: 'medium',
      type: 'Technical Task',
      assignedTo: []
    });
    this.subtasks.clear();
    this.newSubtaskTitle = '';
  }

  close() {
    this.closed.emit();
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value && input.value < this.today) {
      input.value = this.today;
      this.taskForm.patchValue({ dueDate: this.today });
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close();
    }
  }
}
