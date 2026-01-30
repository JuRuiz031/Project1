import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

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
export class AccountView implements OnInit {
  private navigation = inject(NavigationService);
  private userApi = inject(UserApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  apiError = signal('');
  showNotification = signal(false);
  user = signal<AccountViewModel>({
    id: '',
    name: '',
    email: '',
    role: '',
  });

  constructor() {
    this.loadUserData();
  }

  ngOnInit(): void {
    // Check for success in navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;
    
    if (state?.['success']) {
      this.showNotification.set(true);
      setTimeout(() => this.showNotification.set(false), 3000);
    }
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
    this.navigation.goToHome();
  }

  goToEditUser(): void {
    this.navigation.goToEditUser();
  }

  logOut(): void {
    localStorage.clear();
    this.navigation.goToLogin();
  }
}