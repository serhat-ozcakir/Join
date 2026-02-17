import { Component, inject, OnInit, computed } from '@angular/core';
import { Supabase, Contact } from '../../../../supabase';

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  supabase = inject(Supabase);

    /**
   * Array von Farben für Avatare.
   */
  private avatarColors = [
    '#FF7A00', // Orange
    '#9327FF', // Lila
    '#6E52FF', // Blau-Lila
    '#FC71FF', // Pink
    '#FFBB2B', // Gelb
    '#1FD7C1', // Türkis
    '#462F8A', // Dunkel-Lila
    '#FF4646', // Rot
    '#00BEE8', // Cyan
    '#FF745E', // Koralle
  ];


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
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }
}

