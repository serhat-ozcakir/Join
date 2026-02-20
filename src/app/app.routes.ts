import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login-page/login-page')
            .then(m => m.LoginPage)
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup-page/signup-page')
            .then(m => m.SignupPage)
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/contacts/pages/contacts-page/contacts-page')
            .then(m => m.ContactsPage)
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./features/summary/pages/summary-page/summary-page')
            .then(m => m.SummaryPage)
      },
      {
        path: 'add-task',
        loadComponent: () =>
          import('./features/add-task/pages/add-task-page/add-task-page')
            .then(m => m.AddTaskPage)
      },
      {
        path: 'board',
        loadComponent: () =>
          import('./features/board/pages/board-page/board-page')
            .then(m => m.BoardPage)
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/privacy/privacy-policy-page/privacy-policy-page')
            .then(m => m.PrivacyPolicyPage)
      },
      {
        path: 'legal',
        loadComponent: () =>
          import('./features/legal/legal-notice-page/legal-notice-page')
            .then(m => m.LegalNoticePage)
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/help/help-page/help-page')
            .then(m => m.HelpPage)
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];