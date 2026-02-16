import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Datenmodell eines Kontakts.
 *
 * id     → wird von der Datenbank vergeben
 * name   → Name des Kontakts (Pflichtfeld)
 * email  → E-Mail-Adresse (Pflichtfeld)
 * phone  → optionale Telefonnummer
 */
export interface Contact {
  id?: string;
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

/*   data enthält nicht alle Informationen der gesamten Datenbank, sondern:
  ✅ alle ausgewählten Datensätze der abgefragten Tabelle */
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
   * Fügt einen neuen Kontakt hinzu.
   * Danach werden alle Kontakte neu geladen.
   */
  async addContact(contact: Contact) {
    const { error } = await this.supabase
      .from('contacts')
      /** Füge den Inhalt des Objekts contact als neue Zeile in die Datenbank ein. */
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