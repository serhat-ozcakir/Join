import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../../supabase';

/**
 * Login page component that handles user authentication.
 * Supports email/password login and guest access.
 */
@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  supabase = inject(Supabase);
  router = inject(Router);

  /** The user's email input. */
  email = signal('');

  /** The user's password input. */
  password = signal('');

  /**
   * Attempts to sign in the user with the provided email and password.
   * Navigates to the summary page on success.
   */
  async login() {
    const success = await this.supabase.signIn(this.email(), this.password());
    if (success) {
      this.router.navigate(['/summary']);
    }
  }

  /** Logs the user in as a guest and navigates to the summary page. */
  guestLogin() {
    this.supabase.guestLogin();
    this.router.navigate(['/summary']);
  }
}
