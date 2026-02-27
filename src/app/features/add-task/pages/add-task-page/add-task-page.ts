import { Component, inject } from '@angular/core';
import { 
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Supabase } from '../../../../supabase';

@Component({
  selector: 'app-add-task-page',
  imports: [
    RouterOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './add-task-page.html',
  styleUrl: './add-task-page.scss',
})
export class AddTaskPage {

  supabaseService = inject(Supabase);

  taskForm = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    description: new FormControl('', {
      validators: [Validators.maxLength(10)]
    }),
    due_at: new FormControl('', {
      validators: [Validators.required]
    }),
    priority: new FormControl('medium'),
    type: new FormControl('Technical Task', {
      validators: [Validators.required]
    }),
    subtasks: new FormControl('', {
      validators: [Validators.minLength(1)]
    }),
  });

  async formSubmit() {
    if (this.taskForm.invalid) return;

    console.log(this.taskForm.value);

    const { data, error } = await this.supabaseService.supabase
      .from('tasks')
      .insert([this.taskForm.value])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    console.log('Task erstellt:', data);
  }
}