import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';
import { EditUser } from './edit-user/edit-user';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path : '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-account', component: CreateAccount },
  { path : 'edit-user', component: EditUser }
];