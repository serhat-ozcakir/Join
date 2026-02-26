import { Component, EventEmitter, Input, Output, ViewChild, ViewChildren, AfterViewInit, QueryList, ElementRef, TemplateRef } from '@angular/core';
import { TaskCard } from '../task-card/task-card';
import { Task, Status } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDropList, CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { inject } from '@angular/core';
import { Supabase } from '../../../../supabase';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, TaskCard, CdkDrag, CdkDropList, DragDropModule],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn implements AfterViewInit {
  @Input() title = '';
  @Input() tasks: Task[] = [];
  @Input() columnId!: Status;
  @Input() connectedDropLists: string[] = [];
  @Output() taskSelected = new EventEmitter<Task>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() taskDropped = new EventEmitter<{ task: Task; newStatus: Status }>();

  @ViewChild(CdkDropList) dropList!: CdkDropList<Task[]>;
@ViewChildren('taskElement') taskElements!: QueryList<ElementRef>;
  @ViewChild('previewContainer', { read: TemplateRef }) previewTemplate!: TemplateRef<any>;



  private supabase = inject(Supabase);

  isDragOver = false;
  isDragging = false;
   draggedTaskIndex = -1;
  previewContainer: TemplateRef<any> | string = 'body';
  draggedElement: ElementRef | null = null;


  ngAfterViewInit(): void {
    if (!this.connectedDropLists || this.connectedDropLists.length === 0) {
      this.connectedDropLists = ['todo', 'inProgress', 'awaitFeedback', 'done'];
    }
    this.previewContainer = this.previewTemplate;
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.previousContainer.data[event.previousIndex];

    if (!task) {
      console.error('Task not found');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      task.status = this.columnId;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.updateTaskStatus(task);
      this.taskDropped.emit({ task, newStatus: this.columnId });
    }

    this.isDragOver = false;
  }

  private async updateTaskStatus(task: Task): Promise<void> {
    try {
      console.log(`Updating task ${task.id} to status ${task.status}`);

      const { error } = await this.supabase.supabase
        .from('tasks')
        .update({ status: task.status })
        .eq('id', task.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`Task ${task.id} updated successfully`);
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task. Please try again.');
    }
  }

  onDropListEntered(): void {
    this.isDragOver = true;
  }

  onDropListExited(): void {
    this.isDragOver = false;
  }

  onDragStarted(event: any): void {
    this.isDragging = true;
  }

  onDragEnded(event: any): void {
    this.isDragging = false;
    this.isDragOver = false;
  }

  onTaskSelected(task: Task): void {
    if (!this.isDragging) {
      this.taskSelected.emit(task);
    }
  }

  onAddTask(): void {
    this.addClicked.emit();
  }

  getEmptyMessage(): string {
    return this.tasks.length === 0 ? `No tasks in ${this.title}` : '';
  }
}
