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
}
