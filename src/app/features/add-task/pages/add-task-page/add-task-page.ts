import { Component } from '@angular/core';
import {FormBuilder,FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { RouterOutlet } from '@angular/router';

/** Page for creating new tasks with title, description, priority, and assignment. */
@Component({
  selector: 'app-add-task-page',
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './add-task-page.html',
  styleUrl: './add-task-page.scss',
})
export class AddTaskPage {
  taskForm = new FormGroup({
    titel: new FormControl('', {
      validators: [Validators.maxLength(10)]
    }),
    description: new FormControl('', {
      validators: [Validators.maxLength(10)]
    }),
    date: new FormControl('', {
      validators: [Validators.minLength(1)]
    }),
    category: new FormControl('', {
      validators: [Validators.minLength(1)]
    }),
    subtasks: new FormControl('', {
      validators: [Validators.minLength(1)]
    }),
  })

    formSubmit(){
    console.log('Erfolgreich');
  }
}
