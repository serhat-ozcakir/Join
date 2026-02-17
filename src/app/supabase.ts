import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';

/**
 * Datenmodell eines Kontakts.
 *
 * id      → wird von der Datenbank vergeben
 * user_id → ID des Benutzers, dem der Kontakt gehört
 * name    → Name des Kontakts (Pflichtfeld)
 * email   → E-Mail-Adresse (Pflichtfeld)
 * phone   → optionale Telefonnummer
 */
export interface Contact {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Supabase-Service.
 *
 * Dieser Service kapselt:
 * - die Verbindung zur Supabase-Datenbank
 * - das Laden und Verwalten von Kontakten
 * - UI-Zustände mittels Angular Signals
 *
 * Durch providedIn: 'root' steht der Service
 * global in der gesamten App zur Verfügung.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {

  /**
   * URL des Supabase-Projekts.
   */
  private supabaseUrl = 'https://rtunkmriznurqroovzij.supabase.co';

  /**
   * Aktuell eingeloggter Benutzer.
   */
  currentUser = signal<User | null>(null);

  /**
   * Gibt an, ob der Benutzer eingeloggt ist.
   */
  isLoggedIn = computed(() => !!this.currentUser());

  /**
   * Auth Fehlermeldung.
   */
  authError = signal<string | null>(null);

  /**
   * Auth Loading Status.
   */
  authLoading = signal<boolean>(false);

  /**
   * Öffentlicher API-Key (anon key) für den Zugriff.
   */
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dW5rbXJpem51cnFyb292emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTI4MjAsImV4cCI6MjA4Njc4ODgyMH0.J4bDrpH72a81aHGBdHvT5Vrl30NgoZTOB8wvAHwmIoE';

  /**
   * Initialisierung des Supabase Clients.
   */
  supabase: SupabaseClient = createClient(
    this.supabaseUrl,
    this.supabaseKey
  );

  constructor(private router: Router) {
    // Session beim Start prüfen
    this.initAuth();
  }

  /**
   * Initialisiert Auth und überwacht Session-Änderungen.
   */
  private async initAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.currentUser.set(session?.user ?? null);

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  /**
   * Benutzer einloggen.
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
    return true;
  }

  /**
   * Neuen Benutzer registrieren.
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

  /**
   * Benutzer ausloggen.
   */
  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Liste aller geladenen Kontakte.
   */
  contacts = signal<Contact[]>([]);

  /**
   * Aktuell ausgewählter Kontakt im UI.
   */
  selectedContact = signal<Contact | null>(null);

  /**
   * Zeigt an, ob gerade Daten geladen werden.
   */
  loading = signal<boolean>(false);

  /**
   * Enthält eine Fehlermeldung, falls ein Fehler auftritt.
   */
  error = signal<string | null>(null);

  /**
   * Steuert die Anzeige des Kontaktformulars.
   */
  showForm = signal<boolean>(false);

  /**
   * Gibt an, ob ein Kontakt bearbeitet wird.
   */
  editMode = signal<boolean>(false);

  /**
   * Lädt alle Kontakte aus der Datenbank.
   * Sortiert nach Namen.
   */
/**
 * Lädt alle Kontakte aus der Supabase-Datenbank und speichert sie im State.
 *
 * Ablauf:
 * 1. Aktiviert den Ladezustand.
 * 2. Ruft alle Einträge aus der Tabelle `contacts` ab und sortiert sie nach Name.
 * 3. Deaktiviert den Ladezustand nach Abschluss der Anfrage.
 * 4. Bei einem Fehler wird die Fehlermeldung gespeichert.
 * 5. Bei Erfolg werden die geladenen Kontakte im State gespeichert.
 *
 * async Funktion ohne Rückgabewert.
 * Rückgabe: Promise<void>
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

  /* Daten werden im Signal gespeichert */
  this.contacts.set(data || []);
}

  /**
   * Fügt einen neuen Kontakt hinzu.
   * Danach werden alle Kontakte neu geladen.
   */
  async addContact(contact: Contact) {
    const { error } = await this.supabase
      .from('contacts')
      .insert([contact]);

    if (error) throw error;

    await this.getContacts();
  }

  /**
   * Aktualisiert einen bestehenden Kontakt.
   *
   * @param id      ID des Kontakts
   * @param contact zu aktualisierende Felder
   */
  async updateContact(id: string, contact: Partial<Contact>) {
    const { error } = await this.supabase
    /**
      * Aktualisiert den Datensatz in der Tabelle `contacts`
      * mit den neuen Werten aus `contact`,
      * dessen `id` dem übergebenen Wert entspricht.
      */
      .from('contacts')
      .update(contact)
      .eq('id', id);

    if (error) throw error;

    await this.getContacts();
  }

  /**
   * Löscht einen Kontakt anhand der ID.
   * Setzt anschließend die Auswahl zurück
   * und lädt die Kontaktliste neu.
   */
  async deleteContact(id: string) {
    const { error } = await this.supabase
    /**
     * Löscht den Datensatz aus der Tabelle `contacts`,
     * dessen `id` dem übergebenen Wert entspricht.
     */
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    this.selectedContact.set(null);
    await this.getContacts();
  }
}
