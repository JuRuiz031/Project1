import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-delete-poll',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delete-poll.html',
  styleUrls: ['./delete-poll.css'],
})
export class DeletePoll {
  private router = inject(Router);

  // Placeholder values (swap these later when you load real poll data)
  pollName = 'Poll Name';
  calendarName = 'Calendar Name';

  apiError = '';
  isDeleting = false;

  confirmDelete(): void {
    this.apiError = '';
    this.isDeleting = true;

    // Placeholder: replace with API call (e.g., PollService.deletePoll(id))
    console.log('Deleting poll:', {
      pollName: this.pollName,
      calendarName: this.calendarName,
    });

    setTimeout(() => {
      this.isDeleting = false;
      this.router.navigateByUrl('/main-page');
    }, 400);
  }

  cancelDelete(): void {
    this.router.navigateByUrl('/edit-poll');
  }
}
