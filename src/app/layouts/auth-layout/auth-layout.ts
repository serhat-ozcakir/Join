import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Layout component for authentication pages (login, signup).
 * Tracks the current route to conditionally display signup-specific UI elements.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  /** Whether the current route is the signup page. */
  isSignupPage = false;

  /**
   * Subscribes to router navigation events to track which auth page is active.
   * @param router - The Angular Router instance.
   */
  constructor(private router: Router) {
    this.updateIsSignupPage();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() =>
      this.updateIsSignupPage());
  }

  /** Updates the isSignupPage flag based on the current URL. */
  private updateIsSignupPage() {
    this.isSignupPage = this.router.url.startsWith('/signup');
  }
}
