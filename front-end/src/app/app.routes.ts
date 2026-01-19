import { Routes } from '@angular/router';
import { AccountView } from './account-view/account-view';
import { Login } from './features/auth/login/login';
import { CreateAccount } from './features/auth/create-account/create-account';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'create-account', component: CreateAccount },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'account', component: AccountView },
    { path: 'account', redirectTo: 'account', pathMatch: 'full' },
];