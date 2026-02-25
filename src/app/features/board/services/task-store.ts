import { Injectable } from '@angular/core';
import { Task, Status, TaskPriority, TaskType } from '../models/task.model';
import { Supabase } from '../../../supabase';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  constructor(private supabase: Supabase) {}

  // Method to get all tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.supabase.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return (data || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type || 'Technical Task',
      priority: task.priority,
      assignees: task.assignees || [],
      subtasks: task.subtasks || [],
      createdAt: task.created_at,
      dueDate: task.due_at,
    }));
  }

  // Method to add a new task
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
      console.error('User not authenticated');
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
      console.error('Error adding task:', error);
      return null;
    }

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

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await this.supabase.supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        type: updates.type,
        priority: updates.priority,
        assignees: updates.assignees,
        subtasks: updates.subtasks,
        due_at: updates.dueDate || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return data ? {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      type: data.type || 'Technical Task',
      priority: data.priority,
      assignees: data.assignees || [],
      subtasks: data.subtasks || [],
      createdAt: data.created_at,
      dueDate: data.due_at,
    } : null;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await this.supabase.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  }
}
