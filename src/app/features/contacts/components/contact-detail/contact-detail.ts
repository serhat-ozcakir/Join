import { Component, inject, Output, EventEmitter } from '@angular/core';
import { Supabase } from '../../../../supabase';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';
import { avatarColors } from '../contact-list/contact-list';

@Component({
  selector: 'app-contact-detail',
  imports: [CommonModule],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail {
  supabase = inject(Supabase);
  fabOpen = false;

  @Output() closeDetail = new EventEmitter<void>();

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Gibt eine konsistente Farbe basierend auf dem Namen zurück.
   * Gleicher Name = gleiche Farbe.
   */
  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
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
    if (contact?.id) {
      await this.supabase.deleteContact(contact.id);
    }
  }

  onClose() {
    this.closeDetail.emit();
  }

  toggleFab(e?: Event) {
    e?.stopPropagation();
    this.fabOpen = !this.fabOpen;
  }

  closeFab() {
    this.fabOpen = false;
  }

  @HostListener('document:click')
  onDocClick() {
    this.fabOpen = false;
  }
}
