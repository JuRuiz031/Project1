import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // User has a token, allow access
    return true;
  }

  // No token, redirect to login
  console.warn('[AuthGuard] No token found, redirecting to login');
  router.navigate(['/login']);
  return false;
};
