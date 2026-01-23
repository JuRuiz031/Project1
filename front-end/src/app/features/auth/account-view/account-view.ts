import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type AccountViewModel = {
  id: string;
  name: string;
  email: string;
  role: string;
};

@Component({
  selector: 'app-account-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-view.html',
  styleUrl: './account-view.css',
})
export class AccountView {
  apiError = '';

  // TODO: Replace with real data from an Auth/User service.
  user: AccountViewModel = {
    id: 'u-001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'User',
  };

  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard/main-page']);
  }

  goToEditUser(): void {
    this.router.navigate(['/edit-user']);
  }

  logOut(): void {
    this.router.navigate(['/login']);
  }
}