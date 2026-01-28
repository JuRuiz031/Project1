import { Component, OnInit, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventService } from '../../../shared/services/event.service';
import { DeleteEventDTO } from '../../../shared/models/events/delete-event.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-delete-event-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './delete-event-modal.html',
  styleUrls: ['./delete-event-modal.css'],
})
export class DeleteEventModal implements OnInit {
  private calendarService = inject(CalendarService);
  private eventService = inject(EventService);

  // Inputs/Outputs
  eventId = input.required<string>();
  close = output<void>();
  eventDeleted = output<string>(); // emits event ID when deleted

  private eventIdValue = '';
  private calendarId = '';

  // Signals (modern Angular)
  eventName = signal('');
  calendarName = signal('');
  apiError = signal('');
  isDeleting = signal(false);

  ngOnInit(): void {
    this.apiError.set('');

    const id = this.eventId();
    if (!id) {
      this.apiError.set('Missing event id');
      return;
    }
    this.eventIdValue = id;

    // Load the event and calendar name
    this.calendarService.getByEventIds([id])
      .pipe(take(1))
      .subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        const ev = res.events?.[0];
        if (!ev) {
          this.apiError.set('Event not found');
          return;
        }

        this.calendarId = ev.calendar_id ?? '';
        this.eventName.set(ev.title ?? 'Event');

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
      error: () => this.apiError.set('Could not load event'),
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

    if (!this.eventIdValue) {
      this.apiError.set('Missing event id');
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

    const dto: DeleteEventDTO = {
      user_id: String(userId),
      calendar_id: String(this.calendarId),
    };

    this.isDeleting.set(true);

    this.eventService.delete(this.eventIdValue, dto)
      .pipe(take(1))
      .subscribe({
      next: (deleted: boolean) => {
        this.isDeleting.set(false);

        if (!deleted) {
          this.apiError.set('Could not delete event');
          return;
        }

        this.eventDeleted.emit(this.eventIdValue);
        this.close.emit();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.apiError.set(
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not delete event'
        );
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
