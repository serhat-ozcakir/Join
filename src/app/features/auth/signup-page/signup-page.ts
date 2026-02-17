import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../../supabase';

@Component({
  selector: 'app-signup-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {
  supabase = inject(Supabase);
  router = inject(Router);

  displayName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  successMessage = signal('');

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
