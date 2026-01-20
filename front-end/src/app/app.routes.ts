import { Routes } from '@angular/router';
import { AccountView } from './account-view/account-view';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/create-calendar/create-calendar';
import { EditUser } from './edit-user/edit-user';
import { ViewCalendarGroup } from './view-calendar-group/view-calendar-group';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path : '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-account', component: CreateAccount },
  { path: 'create-calendar', component: CreateCalendar },
  { path: 'account', component: AccountView },
  { path: 'account', redirectTo: 'account', pathMatch: 'full' },
  { path : 'edit-user', component: EditUser },
  { path: 'view-calendar-group', component: ViewCalendarGroup }
];