import { CommonModule } from '@angular/common';
import { Component,inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Supabase } from '../../../supabase';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
 supabase = inject(Supabase);

  getInitials(): string {
    if (this.supabase.isGuest()) {
      return 'G';
    }

    const profile = this.supabase.currentProfile();
    if (!profile) return '?';

    const displayName = profile.display_name;

    if (displayName && displayName.trim()) {
      const parts = displayName.trim().split(' ').filter((p: string) => p.length > 0);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    }

    return '?';
  }


isMenuOpen = false;

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(){
    this.isMenuOpen = false;
  }
}
