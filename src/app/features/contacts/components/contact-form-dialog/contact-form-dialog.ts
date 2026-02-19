import { Component, inject, signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Supabase, Contact } from '../../../../supabase';
import { ContactsPage } from '../../pages/contacts-page/contacts-page';

/**
 * Custom validator: Name darf keine Zahlen enthalten.
 */
function noNumbersValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (value && /\d/.test(value)) {
    return { noNumbers: 'Name must not contain numbers' };
  }
  return null;
}

/**
 * Custom validator: Name muss mindestens 2 Wörter enthalten (Vor- und Nachname).
 */
function twoWordsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (value) {
    const words = value.split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length < 2) {
      return { twoWords: 'Please enter first and last name' };
    }
  }
  return null;
}

/**
 * Custom validator: Phone muss nur Zahlen und optional + enthalten.
 */
function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (value) {
    const cleaned = value.replace(/\s/g, '');
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(cleaned)) {
      return { phone: 'Phone must contain only numbers (and optional +)' };
    }
  }
  return null;
}

@Component({
  selector: 'app-contact-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form-dialog.html',
  styleUrl: './contact-form-dialog.scss',
})

export class ContactFormDialog {
  supabase = inject(Supabase);
  contactPage = inject(ContactsPage);
  fb = inject(FormBuilder);

  isClosing = signal(false);
  saving = signal(false);

  /**
   * Reactive Form mit Validators
   */
  contactForm = this.fb.group({
    name: ['', [Validators.required, noNumbersValidator, twoWordsValidator]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]]
  });

  get nameControl() { return this.contactForm.get('name')!; }
  get emailControl() { return this.contactForm.get('email')!; }
  get phoneControl() { return this.contactForm.get('phone')!; }

  /**
   * Gibt die passende Fehlermeldung für ein Control zurück.
   */
  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['noNumbers']) return errors['noNumbers'];
    if (errors['twoWords']) return errors['twoWords'];
    if (errors['phone']) return errors['phone'];
    return '';
  }

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
        document.body.style.overflow = 'hidden';

        if (this.supabase.editMode() && this.supabase.selectedContact()) {
          const contact = this.supabase.selectedContact()!;
          this.contactForm.patchValue({
            name: contact.name,
            email: contact.email,
            phone: this.formatPhoneInput(contact.phone || '')
          });
        } else {
          this.contactForm.reset();
        }
      } else {
        document.body.style.overflow = '';
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
      this.contactForm.reset();
    }, 400);
  }

  async saveContact() {
    this.markAllFieldsAsTouched();
    if (!this.contactForm.valid) return;
    this.saving.set(true);
    try {
      await this.createOrUpdateContact();
      this.closeForm();
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      this.saving.set(false);
    }
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  private buildContactFromForm(): Contact {
    const formValue = this.contactForm.value;
    return {
      name: formValue.name?.trim() || '',
      email: formValue.email?.trim() || '',
      phone: formValue.phone?.replace(/\s/g, '') || '',
    };
  }

  private async createOrUpdateContact() {
    const contact = this.buildContactFromForm();
    const selectedId = this.supabase.selectedContact()?.id;
    if (this.supabase.editMode() && selectedId) {
      await this.supabase.updateContact(selectedId, contact);
    } else {
      await this.supabase.addContact(contact);
      this.contactPage.disappearSwitch(true);
    }
  }

formatPhoneInput(value: string): string {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/[^\d]/g, '');
  const cleaned = hasPlus ? '+' + digits : digits;
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
  this.phoneControl.setValue(formatted, { emitEvent: false });
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
