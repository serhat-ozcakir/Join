import { Component, inject, Output, EventEmitter } from '@angular/core';
import { Supabase } from '../../../../supabase';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';
import { avatarColors } from '../contact-list/contact-list';

/**
 * Displays the details of a selected contact including name, email, phone,
 * and provides edit/delete actions. On mobile, a FAB menu replaces inline buttons.
 */
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

  /**
   * Extracts the first two initials from a full name.
   * @param name - The full name of the contact.
   * @returns Up to two uppercase initials (e.g. "JD" for "John Doe").
   */
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Returns a consistent avatar color based on the contact's name.
   * Same name always produces the same color.
   * @param name - The full name of the contact.
   * @returns A hex color string from the predefined avatar color palette.
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
   * Opens the contact form dialog in edit mode for the currently selected contact.
   */
  editContact() {
    this.supabase.editMode.set(true);
    this.supabase.showForm.set(true);
  }

  /**
   * Deletes the currently selected contact from the database.
   */
  async deleteContact() {
    const contact = this.supabase.selectedContact();
    if (contact?.id) {
      await this.supabase.deleteContact(contact.id);
      this.supabase.selectedContact.set(null);
      if (window.innerWidth <= 991) {
        this.closeDetail.emit();
      }
    }
  }

  /**
   * Formats a raw phone number string for display with spaces.
   * Handles optional country code prefix (e.g. "+49 1234 5678").
   * @param value - The raw phone number string.
   * @returns The formatted phone number with grouped digits.
   */
  formatPhone(value: string): string {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      const countryCode = cleaned.substring(0, 3);
      const rest = cleaned.substring(3);
      const formatted = rest.match(/.{1,4}/g)?.join(' ') || '';
      return `${countryCode} ${formatted}`.trim();
    }
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }

  /**
   * Emits the closeDetail event to hide the detail view on mobile.
   */
  onClose() {
    this.closeDetail.emit();
  }

  /**
   * Toggles the floating action button menu visibility.
   * @param e - Optional event to stop propagation.
   */
  toggleFab(e?: Event) {
    e?.stopPropagation();
    this.fabOpen = !this.fabOpen;
  }

  /**
   * Closes the floating action button menu.
   */
  closeFab() {
    this.fabOpen = false;
  }

  /**
   * Closes the FAB menu when clicking anywhere outside of it.
   */
  @HostListener('document:click')
  onDocClick() {
    this.fabOpen = false;
  }
}
