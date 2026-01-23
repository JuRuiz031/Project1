import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delete-user.html',
  styleUrls: ['./delete-user.css'],
})
export class DeleteUser {
  private router = inject(Router);

  // Placeholder (swap later when you load the real user profile data)
  userName = 'Your Name';

  apiError = '';
  isDeleting = false;

  confirmDelete(): void {
    this.apiError = '';
    this.isDeleting = true;

    // Placeholder: replace with API call (e.g., UserService.deleteUser(id))
    console.log('Deleting user profile:', { userName: this.userName });

    setTimeout(() => {
      this.isDeleting = false;
      this.router.navigateByUrl('/login');
    }, 400);
  }
}
