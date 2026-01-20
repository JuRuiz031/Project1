import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/create-calendar/create-calendar';
import { MainPage } from './features/dashboard/main-page/main-page';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'create-account', component: CreateAccount },
  { path: 'main-page', component: MainPage },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-calendar', component: CreateCalendar },
];