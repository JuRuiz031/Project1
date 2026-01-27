import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserApiService } from '../../../shared/services/api/user-api.service';

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
  private router = inject(Router);
  private userApi = inject(UserApiService);

  apiError = signal('');
  user = signal<AccountViewModel>({
    id: '',
    name: '',
    email: '',
    role: '',
  });

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        this.apiError.set('No user found in session');
        return;
      }

      const userData = JSON.parse(userString);
      const userId = String(userData.user_id ?? '');

      if (!userId) {
        this.apiError.set('Invalid user data');
        return;
      }

      this.userApi.getUserById(userId).subscribe({
        next: (fullUser: any) => {
          this.user.set({
            id: String(fullUser.user_id ?? ''),
            name: String(fullUser.username ?? ''),
            email: String(fullUser.email ?? ''),
            role: String(fullUser.role ?? 'User'),
          });
        },
        error: (err) => {
          console.error('Failed to fetch user details:', err);
          this.apiError.set('Failed to load user details');
        },
      });
    } catch (err) {
      this.apiError.set('Failed to load user data');
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard/main-page']);
  }

  goToEditUser(): void {
    this.router.navigate(['/edit-user']);
  }

  logOut(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}