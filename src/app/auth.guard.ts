import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Supabase } from './supabase';

/**
 * Auth Guard - schützt Routen vor nicht-authentifizierten Zugriffen.
 * Leitet zu /login um, wenn der Benutzer nicht eingeloggt ist.
 */
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(Supabase);
  const router = inject(Router);

  // Guest Login erlauben
  if (supabase.isGuest()) {
    return true;
  }

  // Warte auf Session-Check
  const { data: { session } } = await supabase.supabase.auth.getSession();

  if (session) {
    return true;
  }

  // Nicht eingeloggt → zu Login umleiten
  router.navigate(['/login']);
  return false;
};
