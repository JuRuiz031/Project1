import { Routes } from '@angular/router';
import { AccountView } from './features/auth/account-view/account-view';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/calendar/create-calendar/create-calendar';

import { MainPageComponent } from './features/dashboard/main-page/main-page';

import { EditUser } from './features/auth/edit-user/edit-user';
import { ViewCalendarGroup } from './features/calendar/view-calendar-group/view-calendar-group';
import { CreateEvent } from './features/event/create-event/create-event';
import { CreatePoll } from './features/poll/create-poll/create-poll';
import { EditCalendarGroup } from './features/calendar/edit-calendar-group/edit-calendar-group';
import { DeleteCalendarGroup } from './features/calendar/delete-calendar-group/delete-calendar-group';
import { ViewEvent } from './features/event/view-event/view-event';
import { EditEvent } from './features/event/edit-event/edit-event';
import { DeleteEvent } from './features/event/delete-event/delete-event';
import { ViewPoll } from './features/poll/view-poll/view-poll';
import { EditPoll } from './features/poll/edit-poll/edit-poll';
import { DeletePoll } from './features/poll/delete-poll/delete-poll';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'create-account', component: CreateAccount },

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
  { path: 'view-calendar-group', component: ViewCalendarGroup },
  { path: 'create-event', component: CreateEvent },
  { path: 'create-poll', component: CreatePoll },
  { path: 'edit-calendar-group', component: EditCalendarGroup },
  { path: 'delete-calendar-group', component: DeleteCalendarGroup },
  { path: 'view-event', component: ViewEvent },
  { path: 'edit-event', component: EditEvent },
  { path: 'delete-event', component: DeleteEvent },
  { path: 'view-poll', component: ViewPoll },
  { path: 'edit-poll', component: EditPoll },
  { path: 'delete-poll', component: DeletePoll },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
