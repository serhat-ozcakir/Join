import { Component, inject, OnInit, computed } from '@angular/core';
import { Supabase, Contact } from '../../../../supabase';

/** Predefined color palette used for contact avatar backgrounds. */
export const avatarColors = [
  '#FF7A00',
  '#9327FF',
  '#6E52FF',
  '#FC71FF',
  '#FFBB2B',
  '#1FD7C1',
  '#462F8A',
  '#FF4646',
  '#00BEE8',
  '#FF745E',
];

/**
 * Renders the scrollable list of contacts grouped by their first letter.
 * Provides contact selection and triggers the mobile detail view.
 */
@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  supabase = inject(Supabase);

  /**
   * Groups contacts alphabetically by their first letter.
   * @returns An array of objects containing a letter and its associated contacts.
   */
  groupedContacts = computed(() => {
    const contacts = this.supabase.contacts();
    const groups: { letter: string; contacts: Contact[] }[] = [];
    let currentLetter = '';

    for (const contact of contacts) {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        groups.push({ letter: firstLetter, contacts: [] });
      }
      groups[groups.length - 1].contacts.push(contact);
    }

    return groups;
  });

  /** Fetches all contacts from the database on component initialization. */
  ngOnInit() {
    this.supabase.getContacts();
  }

  /**
   * Sets the selected contact and dispatches a custom event on mobile
   * to trigger the detail view slide-in.
   * @param contact - The contact that was clicked.
   */
  selectContact(contact: Contact) {
    this.supabase.selectedContact.set(contact);

    if (typeof window !== 'undefined' && window.innerWidth <= 991) {
      window.dispatchEvent(new CustomEvent('contact-selected'));
    }
  }

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
}
