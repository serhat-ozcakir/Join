import { Component, inject, signal, effect, computed } from '@angular/core';
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
  isClosing = signal(false);

  name = signal('');
  email = signal('');
  phone = signal('');

  // Track wenn Felder berührt wurden
  nameTouched = signal(false);
  emailTouched = signal(false);
  phoneTouched = signal(false);

  // Loading state
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
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(value)) return 'Phone must contain only numbers (and optional +)';
    return null;
  });

  /**
   * Prüft ob das gesamte Formular gültig ist.
   */
  isFormValid = computed(() => {
    return !this.nameError() && !this.emailError() && !this.phoneError();
  });

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
        // Reset touched state
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
      this.supabase.showForm.set(false);
      this.supabase.editMode.set(false);
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
    // Markiere alle Felder als berührt
    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.phoneTouched.set(true);

    if (!this.isFormValid()) return;

    this.saving.set(true);

    const contact: Contact = {
      name: this.name().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
    };

    try {
      if (this.supabase.editMode() && this.supabase.selectedContact()?.id) {
        await this.supabase.updateContact(this.supabase.selectedContact()!.id!, contact);
      } else {
        await this.supabase.addContact(contact);
      }
      this.closeForm();
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      this.saving.set(false);
    }
  }
}
