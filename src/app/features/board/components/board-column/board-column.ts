import { Component, EventEmitter, Input, Output, ViewChild, ViewChildren, AfterViewInit, QueryList, ElementRef, TemplateRef, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
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
    setTimeout(() => this.cdr.detectChanges());
  }

  private async updateTaskStatus(task: Task): Promise<void> {
    try {

      const { error } = await this.supabase.supabase
        .from('tasks')
        .update({ status: task.status })
        .eq('id', task.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task. Please try again.');
    }
  }

  onDropListEntered(): void {
    setTimeout(() => {
      this.isDragOver = true;
      this.cdr.detectChanges();
    });
  }

  onDropListExited(): void {
    setTimeout(() => {
      this.isDragOver = false;
      this.cdr.detectChanges();
    });
  }

  onDragStarted(event: any): void {
    setTimeout(() => {
      this.isDragging = true;
      this.cdr.detectChanges();
    });
  }

  onDragEnded(event: any): void {
    setTimeout(() => {
      this.isDragging = false;
      this.cdr.detectChanges();
    });
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
