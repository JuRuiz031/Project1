import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { CreateCalendar } from './features/create-calendar/create-calendar';
import { MainPageComponent } from './features/dashboard/main-page/main-page';

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

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
