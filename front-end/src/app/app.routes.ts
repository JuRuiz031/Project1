import { Routes } from '@angular/router';
import { AccountView } from './account-view/account-view';

export const routes: Routes = [
    { path: 'account', component: AccountView },
    // { path: '', redirectTo: 'account', pathMatch: 'full' },
];
