import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../../supabase';

/**
 * Signup page component that handles new user registration.
 * Validates password confirmation before creating the account.
 */
@Component({
  selector: 'app-signup-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {
  supabase = inject(Supabase);
  router = inject(Router);

  /** The user's chosen display name. */
  displayName = signal('');

  /** The user's email address. */
  email = signal('');

  /** The user's chosen password. */
  password = signal('');

  /** Password confirmation for validation. */
  confirmPassword = signal('');

  /** Success message displayed after successful registration. */
  successMessage = signal('');

  /**
   * Validates the password confirmation and registers a new user.
   * Sets a success message on completion prompting email verification.
   */
  async signup() {
    if (this.password() !== this.confirmPassword()) {
      this.supabase.authError.set('Passwords do not match');
      return;
    }

    const success = await this.supabase.signUp(
      this.email(),
      this.password(),
      this.displayName()
    );

    if (success) {
      this.successMessage.set('Account created! Please check your email to confirm.');
    }
  }
}
