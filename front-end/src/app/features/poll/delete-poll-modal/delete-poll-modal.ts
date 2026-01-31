import { Component, OnInit, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { PollService } from '../../../shared/services/poll.service';
import { DeletePollDTO } from '../../../shared/models/polls/delete-poll.dto';

@Component({
  selector: 'app-delete-poll-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './delete-poll-modal.html',
  styleUrls: ['./delete-poll-modal.css'],
})
export class DeletePollModal implements OnInit {
  private calendarService = inject(CalendarService);
  private pollService = inject(PollService);

  // Inputs/Outputs
  pollId = input.required<string>();
  close = output<void>();
  pollDeleted = output<string>(); // emits poll ID when deleted

  private pollIdValue = '';
  private calendarId = '';

  // Signals
  pollName = signal('');
  calendarName = signal('');
  apiError = signal('');
  isDeleting = signal(false);

  ngOnInit(): void {
    this.apiError.set('');

    const id = this.pollId();
    if (!id) {
      this.apiError.set('Missing poll id');
      return;
    }
    this.pollIdValue = id;

    // Load the poll and calendar name
    this.calendarService.getByPollIds([id])
      .pipe(take(1))
      .subscribe({
        next: (res: CalendarFilterResponseDTO) => {
          const poll = res.polls?.[0];
          if (!poll) {
            this.apiError.set('Poll not found');
            return;
          }

          this.calendarId = poll.calendar_id ?? '';
          this.pollName.set(poll.title ?? 'Poll');

          // Load calendar to get friendly name
          this.calendarService.getHomepage()
            .pipe(take(1))
            .subscribe({
              next: (home) => {
                const calendar = home.calendars?.find(c => c.calendar_id === this.calendarId);
                this.calendarName.set(calendar?.name || this.calendarId || 'Calendar');
              },
              error: () => {
                // Fallback to calendar ID if loading calendar fails
                this.calendarName.set(this.calendarId || 'Calendar');
              },
            });
        },
        error: () => this.apiError.set('Could not load poll'),
      });
  }

  private getUserIdFromStorage(): string | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.user_id ?? u?.id ?? null;
    } catch {
      return null;
    }
  }

  confirmDelete(): void {
    this.apiError.set('');

    if (!this.pollIdValue) {
      this.apiError.set('Missing poll id');
      return;
    }

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError.set('Not logged in (missing user id). Please sign in again.');
      return;
    }

    if (!this.calendarId) {
      this.apiError.set('Missing calendar id');
      return;
    }

    const dto: DeletePollDTO = {
      user_id: String(userId),
      calendar_id: String(this.calendarId),
    };

    this.isDeleting.set(true);

    this.pollService.delete(this.pollIdValue, dto)
      .pipe(take(1))
      .subscribe({
        next: (deleted: boolean) => {
          this.isDeleting.set(false);

          if (!deleted) {
            this.apiError.set('Could not delete poll');
            return;
          }

          this.pollDeleted.emit(this.pollIdValue);
          // Don't emit close - parent's onPollDeleted handler closes modals
        },
        error: (err) => {
          this.isDeleting.set(false);
          this.apiError.set(
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not delete poll'
          );
        },
      });
  }

  onClose(): void {
    this.close.emit();
  }
}
