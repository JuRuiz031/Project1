import { Routes } from '@angular/router';
import { Login } from './login/login';
import { ViewCalendarGroup } from './view-calendar-group/view-calendar-group';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path : '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'view-calendar-group', component: ViewCalendarGroup }
];