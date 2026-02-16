import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabaseUrl = 'https://rtunkmriznurqroovzij.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dW5rbXJpem51cnFyb292emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTI4MjAsImV4cCI6MjA4Njc4ODgyMH0.J4bDrpH72a81aHGBdHvT5Vrl30NgoZTOB8wvAHwmIoE';

  supabase: SupabaseClient = createClient(this.supabaseUrl, this.supabaseKey);

  contacts = signal<Contact[]>([]);
  selectedContact = signal<Contact | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showForm = signal<boolean>(false);
  editMode = signal<boolean>(false);

  async getContacts() {
    this.loading.set(true);
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .order('name');

    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.contacts.set(data || []);
  }

  async addContact(contact: Contact) {
    const { error } = await this.supabase
      .from('contacts')
      .insert([contact]);

    if (error) throw error;
    await this.getContacts();
  }

  async updateContact(id: string, contact: Partial<Contact>) {
    const { error } = await this.supabase
      .from('contacts')
      .update(contact)
      .eq('id', id);

    if (error) throw error;
    await this.getContacts();
  }

  async deleteContact(id: string) {
    const { error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.selectedContact.set(null);
    await this.getContacts();
  }
}
