import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { BaseModal } from '../../../shared/components/base-modal/base-modal';

@Component({
  selector: 'app-delete-user-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.css'],
})
export class DeleteUserModalComponent {
  private navigation = inject(NavigationService);
  private userApi = inject(UserApiService);

  // Outputs (cancelled for parent, userDeleted for confirmation)
  cancelled = output<void>();
  confirmed = output<void>();

  // State
  userName = signal('');
  userId = signal('');
  apiError = signal('');
  isDeleting = signal(false);

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
      const username = String(userData.username ?? '');
      
      this.userId.set(userId);
      this.userName.set(username);

      if (!userId) {
        this.apiError.set('Invalid user data');
      }
    } catch (err) {
      this.apiError.set('Failed to load user data');
    }
  }

  confirmDelete(): void {
    this.apiError.set('');

    const userId = this.userId();
    if (!userId) {
      this.apiError.set('Cannot delete: No user ID found');
      return;
    }

    this.isDeleting.set(true);

    this.userApi.deleteUser(userId).subscribe({
      next: () => {
        // Clear local storage and navigate to login
        localStorage.clear();
        this.confirmed.emit();
        this.navigation.goToLogin();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.apiError.set('Failed to delete profile. Please try again.');
        this.isDeleting.set(false);
      },
    });
  }

  cancelDelete(): void {
    this.cancelled.emit();
  }
}
