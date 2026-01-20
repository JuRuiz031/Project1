import { Routes } from '@angular/router';
import { AccountView } from './account-view/account-view';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/create-calendar/create-calendar';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'create-account', component: CreateAccount },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-calendar', component: CreateCalendar },
    { path: 'account', component: AccountView },
    { path: 'account', redirectTo: 'account', pathMatch: 'full' },
];