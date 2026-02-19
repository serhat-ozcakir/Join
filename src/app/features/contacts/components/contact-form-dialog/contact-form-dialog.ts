import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supabase, Contact } from '../../../../supabase';
import { ContactsPage } from '../../pages/contacts-page/contacts-page';

@Component({
  selector: 'app-contact-form-dialog',
  imports: [FormsModule],
  templateUrl: './contact-form-dialog.html',
  styleUrl: './contact-form-dialog.scss',
})
export class ContactFormDialog {
  supabase = inject(Supabase);
  contactPage = inject(ContactsPage);
  isClosing = signal(false);

  name = signal('');
  email = signal('');
  phone = signal('');

  nameTouched = signal(false);
  emailTouched = signal(false);
  phoneTouched = signal(false);

  saving = signal(false);

  /**
   * Validiert den Namen.
   * Muss Vor- und Nachnamen enthalten (min. 2 Wörter).
   * Darf keine Zahlen enthalten.
   */
  nameError = computed(() => {
    const value = this.name().trim();
    if (!value) return 'Name is required';
    if (/\d/.test(value)) return 'Name must not contain numbers';
    const words = value.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 2) return 'Please enter first and last name';
    return null;
  });

  /**
   * Validiert die E-Mail-Adresse.
   * Muss einem gültigen E-Mail-Format entsprechen.
   */
  emailError = computed(() => {
    const value = this.email().trim();
    if (!value) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  });

  /**
   * Validiert die Telefonnummer.
   * Darf nur Zahlen und optional "+" am Anfang enthalten.
   */
phoneError = computed(() => {
  const value = this.phone().trim();
  if (!value) return 'Phone is required';
  const cleaned = value.replace(/\s/g, '');

  const phoneRegex = /^\+?[0-9]+$/;
  if (!phoneRegex.test(cleaned)) return 'Phone must contain only numbers (and optional +)';
  return null;
});

  /**
   * Prüft ob das gesamte Formular gültig ist.
   */
  isFormValid = computed(() => {
    return !this.nameError() && !this.emailError() && !this.phoneError();
  });

  private avatarColors = [
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  constructor() {
    effect(() => {
      if (this.supabase.showForm()) {
        if (this.supabase.editMode() && this.supabase.selectedContact()) {
          const contact = this.supabase.selectedContact()!;
          this.name.set(contact.name);
          this.email.set(contact.email);
          this.phone.set(this.formatPhoneInput(contact.phone || ''));
        } else {
          this.name.set('');
          this.email.set('');
          this.phone.set('');
        }
        this.nameTouched.set(false);
        this.emailTouched.set(false);
        this.phoneTouched.set(false);
      }
    });
  }

  /**
   * Schließt das Formular und setzt alle Felder zurück.
   */
  closeForm() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.supabase.showForm.set(false);
      this.supabase.editMode.set(false);
      this.isClosing.set(false);
      this.name.set('');
      this.email.set('');
      this.phone.set('');
      this.nameTouched.set(false);
      this.emailTouched.set(false);
      this.phoneTouched.set(false);
    }, 400);
  }

  /**
   * Speichert den Kontakt (neu oder aktualisiert).
   */
  async saveContact() {
    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.phoneTouched.set(true);

    if (!this.isFormValid()) return;

    this.saving.set(true);

    const contact: Contact = {
      name: this.name().trim(),
      email: this.email().trim(),
      phone: this.phone().replace(/\s/g, ''),
    };

    try {
      if (this.supabase.editMode() && this.supabase.selectedContact()?.id) {
        await this.supabase.updateContact(this.supabase.selectedContact()!.id!, contact);
      } else {
        await this.supabase.addContact(contact);
      }
      this.closeForm();
      this.contactPage.disappearSwitch(true);
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      this.saving.set(false);
    }
  }

formatPhoneInput(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.substring(0, 3);
    const rest = cleaned.substring(3);
    const formatted = rest.match(/.{1,4}/g)?.join(' ') || '';
    return `${countryCode} ${formatted}`.trim();
  }
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

updatePhone(value: string) {
  const formatted = this.formatPhoneInput(value);
  this.phone.set(formatted);
}

onPhoneKeyPress(event: KeyboardEvent) {
  const char = event.key;
  if (!/[\d+]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(char)) {
    event.preventDefault();
  }
}

  async deleteContact() {
    const contact = this.supabase.selectedContact();
    if (contact?.id ) {
      await this.supabase.deleteContact(contact.id);
    }
  }

}
