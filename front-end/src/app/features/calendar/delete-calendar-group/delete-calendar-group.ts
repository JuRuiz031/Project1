import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-calendar-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-calendar-group.html',
  styleUrls: ['./delete-calendar-group.css'],
})
export class DeleteCalendarGroup {
  private router = inject(Router);

  apiError = '';
  isDeleting = false;

  confirmDelete(): void {
    this.apiError = '';
    this.isDeleting = true;

    // TODO: replace this with your real delete call later
    console.log('Deleting calendar group...');

    // Match delete-event behavior: confirm returns to main-page/dashboard
    setTimeout(() => {
      this.isDeleting = false;
      this.router.navigateByUrl('/main-page');
    }, 400);
  }

  cancel(): void {
    this.router.navigateByUrl('/edit-calendar-group');
  }
}
