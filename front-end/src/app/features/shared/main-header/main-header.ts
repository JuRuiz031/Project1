import { Component, input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BRAND_CONFIG } from '../../../config/brand.config';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-header.html',
  styleUrl: './main-header.css',
})
export class MainHeader {
  private router = inject(Router);
  readonly siteName = BRAND_CONFIG.siteName;

  showProfile = input(true);
  showHome = input(true);

  onLogout(): void {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
