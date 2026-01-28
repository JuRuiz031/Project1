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

import { CreateCalendar } from './features/calendar/create-calendar/create-calendar';
import { ViewCalendarGroup } from './features/calendar/view-calendar-group/view-calendar-group';
import { EditCalendarGroup } from './features/calendar/edit-calendar-group/edit-calendar-group';
import { DeleteCalendarGroup } from './features/calendar/delete-calendar-group/delete-calendar-group';

import { CreateEvent } from './features/event/create-event/create-event';
import { ViewEvent } from './features/event/view-event/view-event';
import { EditEvent } from './features/event/edit-event/edit-event';
import { DeleteEvent } from './features/event/delete-event/delete-event';

import { CreatePoll } from './features/poll/create-poll/create-poll';
import { ViewPoll } from './features/poll/view-poll/view-poll';
import { EditPoll } from './features/poll/edit-poll/edit-poll';
import { DeletePoll } from './features/poll/delete-poll/delete-poll';

export const routes: Routes = [
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

      { path: 'create-calendar', component: CreateCalendar },
      { path: 'account', component: AccountView },
      { path: 'edit-user', component: EditUser },
      { path: 'delete-user', component: DeleteUser },

      { path: 'view-calendar-group', component: ViewCalendarGroup },
      { path: 'edit-calendar-group', component: EditCalendarGroup },
      { path: 'delete-calendar-group', component: DeleteCalendarGroup },

      { path: 'create-event', component: CreateEvent },
      { path: 'view-event/:eventId', component: ViewEvent },
      { path: 'view-event', component: ViewEvent },
      { path: 'edit-event/:eventId', component: EditEvent },
      { path: 'delete-event/:eventId', component: DeleteEvent },

      { path: 'create-poll', component: CreatePoll },
      { path: 'view-poll', component: ViewPoll },
      { path: 'edit-poll', component: EditPoll },
      { path: 'delete-poll', component: DeletePoll },
    ],
  },
];
