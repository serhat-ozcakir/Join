import { Component, inject, OnInit, computed } from '@angular/core';
import { Supabase, Contact } from '../../../../supabase';

    /**
   * Array von Farben für Avatare.
   */
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

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})

export class ContactList implements OnInit {
  supabase = inject(Supabase);

  /**
   * Gruppiert Kontakte nach Anfangsbuchstaben.
   * Gibt ein Array von { letter, contacts } zurück.
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

  ngOnInit() {
    this.supabase.getContacts();
  }

  selectContact(contact: Contact) {
    this.supabase.selectedContact.set(contact);

    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      window.dispatchEvent(new CustomEvent('contact-selected'));
    }
  }

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
}

