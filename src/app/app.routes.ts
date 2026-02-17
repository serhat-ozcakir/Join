import { Routes } from '@angular/router';
import { ContactsPage } from './features/contacts/pages/contacts-page/contacts-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { SignupPage } from './features/auth/signup-page/signup-page';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { AddTaskPage } from './features/add-task/pages/add-task-page/add-task-page';
import { BoardPage } from './features/board/pages/board-page/board-page';
import { SummaryPage } from './features/summary/pages/summary-page/summary-page';
import { authGuard } from './auth.guard';
import { PrivacyPolicyPage } from './features/privacy/privacy-policy-page/privacy-policy-page';
import { LegalNoticePage } from './features/legal/legal-notice-page/legal-notice-page';

/**
 * Routing-Konfiguration der gesamten Anwendung.
 *
 * Die Routen sind in zwei Hauptbereiche aufgeteilt:
 *
 * 1. AuthLayout
 *    - Layout für Authentifizierungsseiten.
 *    - Enthält aktuell die Login-Seite.
 *
 * 2. AppLayout
 *    - Layout für den Hauptbereich der Anwendung nach dem Login.
 *    - Enthält Seiten wie Kontakte, Board, Aufgaben usw.
 *
 * Routing-Verhalten:
 * - Der Aufruf von "/" wird automatisch zu "/login" umgeleitet.
 * - Unbekannte URLs werden ebenfalls zu "/login" umgeleitet.
 */
export const routes: Routes = [
  /**
   * Routen für den Authentifizierungsbereich.
   * Verwendet AuthLayout als übergeordnetes Layout.
   */
  {
    path: '',
    component: AuthLayout,
    children: [
      /**
       * Login-Seite → erreichbar unter /login
       */
      { path: 'login', component: LoginPage },

      /**
       * Signup-Seite → erreichbar unter /signup
       */
      { path: 'signup', component: SignupPage },

      /**
       * Standardroute:
       * Leerer Pfad wird zu /login umgeleitet.
       * Beispiel: "/" → "/login"
       */
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

  /**
   * Routen des Hauptanwendungsbereichs.
   * Verwendet AppLayout als übergeordnetes Layout.
   * canActivate: authGuard schützt diese Routen.
   */
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      /** Kontaktübersicht → /contacts */
      { path: 'contacts', component: ContactsPage },

      /** Dashboard-/Zusammenfassungsseite → /summary */
      { path: 'summary', component: SummaryPage },

      /** Seite zum Erstellen einer Aufgabe → /add-task */
      { path: 'add-task', component: AddTaskPage },

      /** Board-/Kanban-Ansicht → /board */
      { path: 'board', component: BoardPage },
    ],
  },

  /**
   * Wildcard-Route:
   * Fängt alle unbekannten URLs ab und leitet zum Login um.
   */
  {path: 'privacy-policy', component: PrivacyPolicyPage },
  {path: 'legal-notice', component: LegalNoticePage },
  { path: '**', redirectTo: 'login' },

];
