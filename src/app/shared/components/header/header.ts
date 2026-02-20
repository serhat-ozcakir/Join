import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../supabase';

/**
 * Application header component displayed at the top of the main layout.
 * Contains the logo, help button, user initials, and a dropdown menu
 * with navigation links and logout.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  supabase = inject(Supabase);

  /**
   * Returns the initials of the currently logged-in user.
   * Falls back to '?' if no user is available.
   * @returns Up to two uppercase initials derived from the display name or email.
   */
  getInitials(): string {
    const user = this.supabase.currentUser();
    if (!user) return '?';
    const name = user.user_metadata?.['display_name'] || user.email || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  isMenuOpen = false;

  /** Toggles the header dropdown menu visibility. */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /** Closes the header dropdown menu. */
  closeMenu() {
    this.isMenuOpen = false;
  }
}
