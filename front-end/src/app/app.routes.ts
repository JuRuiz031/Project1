import { Routes } from '@angular/router';
import { AccountView } from './features/account-view/account-view';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/create-calendar/create-calendar';
import { EditUser } from './features/edit-user/edit-user';
import { ViewCalendarGroup } from './features/view-calendar-group/view-calendar-group';
import { MainPage } from './features/dashboard/main-page/main-page';
import { CreateEvent } from './features/create-event/create-event';
import { CreatePoll } from './features/create-poll/create-poll';
import { CreateCalendarGroup } from './features/create-calendar-group/create-calendar-group';
import { Delete } from './features/delete/delete';
import { EditCalendarGroup } from './features/edit-calendar-group/edit-calendar-group';
import { DeleteCalendarGroup } from './features/delete-calendar-group/delete-calendar-group';
import { ViewEvent } from './features/view-event/view-event';
import { EditEvent } from './features/edit-event/edit-event';
import { DeleteEvent } from './features/delete-event/delete-event';
import { ViewPoll } from './features/view-poll/view-poll';
import { EditPoll } from './features/edit-poll/edit-poll';
import {DeletePoll } from './features/delete-poll/delete-poll';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-account', component: CreateAccount },
  { path: 'create-calendar', component: CreateCalendar },
  { path: 'account', component: AccountView },
  { path: 'account', redirectTo: 'account', pathMatch: 'full' },
  { path: 'edit-user', component: EditUser },
  { path: 'view-calendar-group', component: ViewCalendarGroup },
  { path: 'main-page', component: MainPage },
  { path: 'create-calendar-group', component: CreateCalendarGroup },
  { path: 'create-event', component: CreateEvent },
  { path: 'create-poll', component: CreatePoll},
  { path: 'delete', component: Delete},
  { path: 'edit-calendar-group', component: EditCalendarGroup},
  { path: 'delete-calendar-group', component: DeleteCalendarGroup},
  { path: 'view-event', component: ViewEvent},
  { path: 'edit-event', component: EditEvent},
  { path: 'delete-event', component: DeleteEvent},
  { path: 'view-poll', component: ViewPoll},
  { path: 'edit-poll', component: EditPoll},
  { path: 'delete-poll', component: DeletePoll}

];