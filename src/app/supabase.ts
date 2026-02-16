import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabaseUrl = 'https://rtunkmriznurqroovzij.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dW5rbXJpem51cnFyb292emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTI4MjAsImV4cCI6MjA4Njc4ODgyMH0.J4bDrpH72a81aHGBdHvT5Vrl30NgoZTOB8wvAHwmIoE';

  supabase: SupabaseClient = createClient(this.supabaseUrl, this.supabaseKey);

  users = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async getUsers() {
    this.loading.set(true);
    this.error.set(null);

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*');

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.users.set(data || []);
  }
}
