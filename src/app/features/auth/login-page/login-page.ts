import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../../supabase';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  supabase = inject(Supabase);
  router = inject(Router);

  email = signal('');
  password = signal('');

  async login() {
    const success = await this.supabase.signIn(this.email(), this.password());
    if (success) {
      this.router.navigate(['/summary']);
    }
  }

  guestLogin() {
    this.router.navigate(['/summary']);
  }
}
