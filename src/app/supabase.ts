import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';

/**
 * Data model for a contact entry.
 *
 * id      - Assigned by the database.
 * user_id - ID of the user who owns the contact.
 * name    - Full name of the contact (required).
 * email   - Email address (required).
 * phone   - Optional phone number.
 */
export interface Contact {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Central Supabase service that manages:
 * - Database connection and authentication
 * - Contact CRUD operations
 * - UI state via Angular Signals
 *
 * Provided in root so it is available as a singleton across the entire app.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {

  /** Supabase project URL. */
  private supabaseUrl = 'https://rtunkmriznurqroovzij.supabase.co';

  /** Currently authenticated user. */
  currentUser = signal<User | null>(null);

  /** Whether the user is logged in as a guest. */
  isGuest = signal<boolean>(false);

  /** Computed user profile derived from user metadata. */
  currentProfile = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.['display_name'] || null
    };
  });

  /** Whether any user (authenticated or guest) is logged in. */
  isLoggedIn = computed(() => !!this.currentUser() || this.isGuest());

  /** Authentication error message, if any. */
  authError = signal<string | null>(null);

  /** Whether an authentication request is in progress. */
  authLoading = signal<boolean>(false);

  /** Public anon key for Supabase API access. */
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dW5rbXJpem51cnFyb292emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTI4MjAsImV4cCI6MjA4Njc4ODgyMH0.J4bDrpH72a81aHGBdHvT5Vrl30NgoZTOB8wvAHwmIoE';

  /** Initialized Supabase client instance. */
  supabase: SupabaseClient = createClient(
    this.supabaseUrl,
    this.supabaseKey
  );

  constructor(private router: Router) {
    this.initAuth();
  }

  /**
   * Initializes authentication by checking the current session
   * and subscribing to auth state changes.
   */
  private async initAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.currentUser.set(session?.user ?? null);

    if (session?.user) {
      this.isGuest.set(false);
    }
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this.isGuest.set(false);
      }
    });
  }

  /**
   * Signs in a user with email and password.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns True if sign-in was successful, false otherwise.
   */
  async signIn(email: string, password: string): Promise<boolean> {
    this.authLoading.set(true);
    this.authError.set(null);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    this.authLoading.set(false);
    if (error) {
      this.authError.set(error.message);
      return false;
    }
    this.currentUser.set(data.user);
    this.isGuest.set(false);
    return true;
  }

  /**
   * Registers a new user with email, password, and optional display name.
   * @param email - The user's email address.
   * @param password - The user's chosen password.
   * @param displayName - Optional display name stored in user metadata.
   * @returns True if registration was successful, false otherwise.
   */
  async signUp(email: string, password: string, displayName?: string): Promise<boolean> {
    this.authLoading.set(true);
    this.authError.set(null);
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    this.authLoading.set(false);
    if (error) {
      this.authError.set(error.message);
      return false;
    }
    return true;
  }

  /** Signs out the current user and navigates to the login page. */
  async signOut() {
    await this.supabase.auth.signOut({ scope: 'local' });
    this.currentUser.set(null);
    this.isGuest.set(false);
    this.router.navigate(['/login']);
  }

  /** Enables guest mode without requiring authentication. */
  guestLogin() {
    this.isGuest.set(true);
  }

  /** List of all loaded contacts. */
  contacts = signal<Contact[]>([]);

  /** Currently selected contact in the UI. */
  selectedContact = signal<Contact | null>(null);

  /** Whether contact data is currently being loaded. */
  loading = signal<boolean>(false);

  /** Error message from the last failed operation. */
  error = signal<string | null>(null);

  /** Controls the visibility of the contact form dialog. */
  showForm = signal<boolean>(false);

  /** Whether the form is in edit mode (vs. create mode). */
  editMode = signal<boolean>(false);

  /**
   * Fetches all contacts from the database, sorted by name,
   * and stores them in the contacts signal.
   */
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

  /**
   * Inserts a new contact into the database and refreshes the contact list.
   * @param contact - The contact data to insert.
   */
  async addContact(contact: Contact) {
    const { error } = await this.supabase
      .from('contacts')
      .insert([contact]);

    if (error) throw error;

    await this.getContacts();
  }

  /**
   * Updates an existing contact in the database and refreshes the contact list.
   * @param id - The ID of the contact to update.
   * @param contact - The fields to update.
   */
  async updateContact(id: string, contact: Partial<Contact>) {
    const { error } = await this.supabase
      .from('contacts')
      .update(contact)
      .eq('id', id);

    if (error) throw error;

    await this.getContacts();
  }

  /**
   * Deletes a contact by ID, clears the selection, and refreshes the contact list.
   * @param id - The ID of the contact to delete.
   */
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
