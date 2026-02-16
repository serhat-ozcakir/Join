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

  editContact() {
    this.supabase.editMode.set(true);
    this.supabase.showForm.set(true);
  }

  async deleteContact() {
    const contact = this.supabase.selectedContact();
    if (contact?.id && confirm('Confirm to delete?')) {
      await this.supabase.deleteContact(contact.id);
    }
  }
}
