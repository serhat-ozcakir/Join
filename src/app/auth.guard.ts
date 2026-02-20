import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Supabase } from './supabase';

/**
 * Route guard that protects authenticated routes.
 * Allows access for guest users and authenticated sessions.
 * Redirects to /login if no valid session or guest mode is active.
 */
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router = inject(Router);

  if (supabase.isGuest()) {
    return true;
  }

  const { data: { session } } = await supabase.supabase.auth.getSession();

  if (session) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
