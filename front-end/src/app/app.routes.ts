import { Routes } from '@angular/router';
import { Login } from './login/login';
import { EditUser } from './edit-user/edit-user';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path : '', redirectTo: '/login', pathMatch: 'full' },
  { path : 'edit-user', component: EditUser }
];