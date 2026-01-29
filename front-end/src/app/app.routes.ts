import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { authGuard } from './shared/guards/auth.guard';
import { loginRedirectGuard } from './shared/guards/login-redirect.guard';

import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { AccountView } from './features/auth/account-view/account-view';
import { EditUser } from './features/auth/edit-user/edit-user';
import { DeleteUser } from './features/auth/delete-user/delete-user';

import { MainPageComponent } from './features/dashboard/main-page/main-page';

import { ViewEvent } from './features/event/view-event/view-event';

// import { CreatePoll } from './features/poll/create-poll/create-poll';
import { EditPoll } from './features/poll/edit-poll/edit-poll';
import { DeletePoll } from './features/poll/delete-poll/delete-poll';

export const routes: Routes = [
  /**
   * PUBLIC GUEST INVITE ROUTES
   * No layout, no authentication required
   * For guests viewing shared event/poll invite links
   */
  {
    path: 'invitelink',
    component: ViewEvent, // Guest-only event viewing
  },

  /**
   * AUTH / PUBLIC ROUTES
   * Header + footer, NO profile button
   * loginRedirectGuard: if already logged in, redirect to main page
   */
  {
    path: '',
    component: AuthLayout,
    canActivate: [loginRedirectGuard],
    children: [
      { path: '', component: Login }, // landing page
      { path: 'login', component: Login },
      { path: 'create-account', component: CreateAccount },
    ],
  },

  /**
   * APP / AUTHENTICATED ROUTES
   * Header + footer WITH profile button
   * Protected by authGuard - requires valid token
   */
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        children: [
          { path: 'main-page', component: MainPageComponent },
          { path: '', pathMatch: 'full', redirectTo: 'main-page' },
        ],
      },

      { path: 'main-page', redirectTo: '/dashboard/main-page', pathMatch: 'full' },

      { path: 'account', component: AccountView },
      { path: 'edit-user', component: EditUser },
      { path: 'delete-user', component: DeleteUser },

      // Event routes removed - now all modals from main-page

      // { path: 'create-poll', component: CreatePoll },
      { path: 'edit-poll/:pollId', component: EditPoll },
      { path: 'delete-poll/:pollId', component: DeletePoll },
    ],
  },
];
