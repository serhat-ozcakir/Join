import { Routes } from '@angular/router';
import { ContactsPage } from './features/contacts/pages/contacts-page/contacts-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { AddTaskPage } from './features/add-task/pages/add-task-page/add-task-page';
import { BoardPage } from './features/board/pages/board-page/board-page';
import { SummaryPage } from './features/summary/pages/summary-page/summary-page';

export const routes: Routes = [
     {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: AppLayout,
    children: [
    { path: '', component: SummaryPage },
    { path: 'contacts', component: ContactsPage },
    { path: 'summary', component: SummaryPage },
    { path: 'add-task', component: AddTaskPage },
    { path: 'board', component: BoardPage},
    ],
  },
  { path: '**', redirectTo: 'login' },
];
