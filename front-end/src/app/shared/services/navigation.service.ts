import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Centralized navigation service with smart routing and fallback handling.
 * Usage: `private navigation = inject(NavigationService);`
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);
  private location = inject(Location);

  // Navigate to any route with optional query parameters
  // example: this.navigation.navigateTo(['/edit-event', eventId])
  navigateTo(route: string | string[], queryParams?: any): void {
    if (Array.isArray(route)) {
      this.router.navigate(route, { queryParams });
    } else {
      this.router.navigateByUrl(route);
    }
  }

  // Go back in history, fallback to /main-page if no history exists
  goBack(fallbackUrl: string = '/main-page'): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.navigateTo(fallbackUrl);
    }
  }

  // ===== CONVENIENCE METHODS FOR COMMON ROUTES =====

  // Navigate to dashboard home
  goToHome(): void {
    this.navigateTo('/dashboard/main-page');
  }

  // Navigate to login page
  goToLogin(): void {
    this.navigateTo('/login');
  }

  // Navigate to user account/profile view
  goToAccount(): void {
    this.navigateTo('/account');
  }

  // Navigate to edit user/profile page
  goToEditUser(): void {
    this.navigateTo('/edit-user');
  }

  // Navigate to delete user account page
  goToDeleteUser(): void {
    this.navigateTo('/delete-user');
  }
}

