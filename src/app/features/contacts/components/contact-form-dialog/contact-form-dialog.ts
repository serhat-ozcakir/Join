import { Component, inject, signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Supabase, Contact } from '../../../../supabase';
import { ContactsPage } from '../../pages/contacts-page/contacts-page';

/**
 * Validates that the name field does not contain any digits.
 * @param control - The form control to validate.
 * @returns A validation error object or null if valid.
 */
function noNumbersValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (value && /\d/.test(value)) {
    return { noNumbers: 'Name must not contain numbers' };
  }
  return null;
}

/**
 * Validates that the name contains at least two words (first and last name).
 * @param control - The form control to validate.
 * @returns A validation error object or null if valid.
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
 * Validates that the phone field contains only digits and an optional leading '+'.
 * @param control - The form control to validate.
 * @returns A validation error object or null if valid.
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

/**
 * Validates email format more strictly than the default Angular email validator.
 * Domain extension must be between 2-4 characters (e.g., .com, .ro, .net, .info).
 * @param control - The form control to validate.
 * @returns A validation error object or null if valid.
 */
function strictEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (value) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    if (!emailRegex.test(value)) {
      return { strictEmail: 'Please enter a valid email address' };
    }
  }
  return null;
}

/**
 * Modal dialog for creating and editing contacts.
 * Contains a reactive form with validation for name, email, and phone fields.
 */
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

  /** Reactive form group with validated name, email, and phone controls. */
  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(20), noNumbersValidator, twoWordsValidator]],
    email: ['', [Validators.required, Validators.maxLength(30), Validators.email, strictEmailValidator]],
    phone: ['', [Validators.required, Validators.maxLength(20), phoneValidator]]
  });

  get nameControl() { return this.contactForm.get('name')!; }
  get emailControl() { return this.contactForm.get('email')!; }
  get phoneControl() { return this.contactForm.get('phone')!; }

  /**
   * Returns the appropriate validation error message for a given form control.
   * @param controlName - The name of the form control (e.g. 'name', 'email', 'phone').
   * @returns The error message string, or an empty string if no error exists.
   */
  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['strictEmail']) return errors['strictEmail'];
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

  /**
   * Extracts the first two initials from a full name.
   * @param name - The full name of the contact.
   * @returns Up to two uppercase initials (e.g. "JD" for "John Doe").
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Returns a consistent avatar color based on the contact's name.
   * @param name - The full name of the contact.
   * @returns A hex color string from the predefined avatar color palette.
   */
  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  /**
   * Initializes the form effect: populates fields in edit mode
   * or resets them when creating a new contact.
   */
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
   * Closes the form dialog with a closing animation and resets all fields.
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

  /**
   * Validates the form, then creates or updates the contact.
   * Shows a saving indicator and closes the form on success.
   */
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

  /** Marks all form controls as touched to trigger validation messages. */
  private markAllFieldsAsTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Extracts and sanitizes the form values into a Contact object.
   * @returns A Contact object ready for database storage.
   */
  private buildContactFromForm(): Contact {
    const formValue = this.contactForm.value;
    return {
      name: formValue.name?.trim() || '',
      email: formValue.email?.trim() || '',
      phone: formValue.phone?.replace(/\s/g, '') || '',
    };
  }

  /**
   * Creates a new contact or updates an existing one based on the current edit mode.
   */
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

  /**
   * Formats a phone number string for display with grouped digits.
   * Allows only a single '+' at the beginning for country codes.
   * @param value - The raw phone input string.
   * @returns The formatted phone number (e.g. "+49 1234 5678").
   */
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

  /**
   * Updates the phone form control with the formatted value.
   * @param value - The raw input value from the phone field.
   */
  updatePhone(value: string) {
    const formatted = this.formatPhoneInput(value);
    this.phoneControl.setValue(formatted, { emitEvent: false });
  }

  /**
   * Prevents non-numeric characters (except '+') from being typed in the phone field.
   * @param event - The keyboard event from the phone input.
   */
  onPhoneKeyPress(event: KeyboardEvent) {
    const char = event.key;
    if (!/[\d+]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(char)) {
      event.preventDefault();
    }
  }

  /**
   * Deletes the currently selected contact from the database.
   */
  async deleteContact() {
    const contact = this.supabase.selectedContact();
    if (contact?.id ) {
      await this.supabase.deleteContact(contact.id);
    }
  }
}
