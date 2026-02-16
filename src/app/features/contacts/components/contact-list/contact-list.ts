import { Component, inject, OnInit } from '@angular/core';
import { Supabase, Contact } from '../../../../supabase';

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  supabase = inject(Supabase);

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
