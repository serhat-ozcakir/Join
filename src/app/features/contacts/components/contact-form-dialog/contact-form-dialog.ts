import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supabase, Contact } from '../../../../supabase';

@Component({
  selector: 'app-contact-form-dialog',
  imports: [FormsModule],
  templateUrl: './contact-form-dialog.html',
  styleUrl: './contact-form-dialog.scss',
})
export class ContactFormDialog {
  supabase = inject(Supabase);

  name = signal('');
  email = signal('');
  phone = signal('');

  constructor() {
    effect(() => {
      if (this.supabase.showForm()) {
        if (this.supabase.editMode() && this.supabase.selectedContact()) {
          const contact = this.supabase.selectedContact()!;
          this.name.set(contact.name);
          this.email.set(contact.email);
          this.phone.set(contact.phone || '');
        } else {
          this.name.set('');
          this.email.set('');
          this.phone.set('');
        }
      }
    });
  }

  closeForm() {
    this.supabase.showForm.set(false);
    this.supabase.editMode.set(false);
    this.name.set('');
    this.email.set('');
    this.phone.set('');
  }

  async saveContact() {
    const contact: Contact = {
      name: this.name(),
      email: this.email(),
      phone: this.phone()
    };

    console.log('Edit mode:', this.supabase.editMode());
    console.log('Selected contact:', this.supabase.selectedContact());

    try {
      if (this.supabase.editMode() && this.supabase.selectedContact()?.id) {
        console.log('Updating ID:', this.supabase.selectedContact()!.id);
        await this.supabase.updateContact(this.supabase.selectedContact()!.id!, contact);
      } else {
        console.log('Adding new contact');
        await this.supabase.addContact(contact);
      }
      this.closeForm();
    } catch (err: any) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  }
}
