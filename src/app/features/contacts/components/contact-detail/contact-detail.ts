import { Component, inject } from '@angular/core';
import { Supabase } from '../../../../supabase';

@Component({
  selector: 'app-contact-detail',
  imports: [],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail {
  supabase = inject(Supabase);

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * steuern nur die Oberfläche (UI) — sie ändern keine Datenbankdaten.
   * „Zeige jetzt das Formular und setze es in den Bearbeitungsmodus.“
   */
  editContact() {
    this.supabase.editMode.set(true);
    this.supabase.showForm.set(true);
  }

  /**
  * Holt den aktuell ausgewählten Kontakt und löscht ihn nach
  * Bestätigung durch den Benutzer aus der Datenbank.
  */
  async deleteContact() {
    const contact = this.supabase.selectedContact();
    if (contact?.id ) {
      await this.supabase.deleteContact(contact.id);
    }
  }
}
