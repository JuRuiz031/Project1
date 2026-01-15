import { Routes } from '@angular/router';
import { Login } from './login/login';
import { CreateAccount } from './create-account/create-account';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'create-account', component: CreateAccount },
  { path : '', redirectTo: '/login', pathMatch: 'full' }
];