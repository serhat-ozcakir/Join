import { Injectable, signal, computed } from '@angular/core';
import { Task, Status, TaskPriority, TaskType } from '../models/task.model';
import { Supabase } from '../../../supabase';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private tasksSignal = signal<Task[]>([]);

  tasks = computed(() => this.tasksSignal());

  constructor(private supabase: Supabase) {
  }

  async loadTasks(): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('tasks')
      .select('*')
       .order('position', { ascending: true })
    .order('created_at', { ascending: false });

    if (error) {
      return;
    }

    const tasks: Task[] = (data || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type || 'Technical Task',
      priority: task.priority,
      assignees: task.assignees || [],
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      createdAt: task.created_at,
      dueDate: task.due_at,
       position: task.position ?? 999,
    }));

    this.tasksSignal.set(tasks);
  }

  async getTasks(): Promise<Task[]> {
    await this.loadTasks();
    return this.tasksSignal();
  }

  async addTask(data: {
    title: string;
    description?: string;
    status: Status;
    type: TaskType;
    priority: TaskPriority;
    assignees?: { id: string; initials: string; name?: string }[];
    subtasks?: { id: string; title: string; done: boolean }[];
    dueDate?: string;
  }): Promise<Task | null> {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) {
      return null;
    }

    const { data: result, error } = await this.supabase.supabase
      .from('tasks')
      .insert([{
        created_by: userId,
        title: data.title,
        description: data.description,
        status: data.status,
        type: data.type,
        priority: data.priority,
        assignees: data.assignees || [],
        subtasks: data.subtasks || [],
        due_at: data.dueDate,
      }])
      .select()
      .single();

    if (error) {
      return null;
    }

    await this.loadTasks();

    return result ? {
      id: result.id,
      title: result.title,
      description: result.description,
      status: result.status,
      type: result.type || 'Technical Task',
      priority: result.priority,
      assignees: result.assignees || [],
      subtasks: result.subtasks || [],
      createdAt: result.created_at,
      dueDate: result.due_at,
    } : null;
  }

 async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {  this.tasksSignal.update(tasks =>
    tasks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    )
  );

  const { data, error } = await this.supabase.supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      type: updates.type,
      priority: updates.priority,
      ...(updates.assignees !== undefined && { assignees: updates.assignees }),
      ...(updates.subtasks !== undefined && { subtasks: updates.subtasks }),
      due_at: updates.dueDate || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    await this.loadTasks();
    return null;
  }

  return data;
}
  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await this.supabase.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return false;
    }

    await this.loadTasks();

    return true;
  }
}
