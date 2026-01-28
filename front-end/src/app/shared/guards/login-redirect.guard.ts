import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // User already logged in, redirect to main page
    console.log('[LoginRedirectGuard] User already logged in, redirecting to main page');
    router.navigate(['/main-page']);
    return false;
  }

  // No token, allow access to login/create-account
  return true;
};
