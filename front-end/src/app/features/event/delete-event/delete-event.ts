import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delete-event.html',
  styleUrls: ['./delete-event.css'],
})
export class DeleteEvent {
  private router = inject(Router);

  // Placeholder values (swap these later when you load real event data)
  eventName = 'Event Name';
  calendarName = 'Calendar Name';

  apiError = '';
  isDeleting = false;

  confirmDelete(): void {
    this.apiError = '';
    this.isDeleting = true;

    // Placeholder: replace with API call (e.g., EventService.deleteEvent(id))
    console.log('Deleting event:', {
      eventName: this.eventName,
      calendarName: this.calendarName,
    });

    setTimeout(() => {
      this.isDeleting = false;
      this.router.navigateByUrl('/main-page');
    }, 400);
  }
}
