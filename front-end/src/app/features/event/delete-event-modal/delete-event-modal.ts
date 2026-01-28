import { Component, OnInit, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  // Display values
  eventName = '';
  calendarName = '';

  // Optional display mapping (same as your other pages)
  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  apiError = '';
  isDeleting = false;

  ngOnInit(): void {
    this.apiError = '';

    const id = this.eventId();
    if (!id) {
      this.apiError = 'Missing event id';
      return;
    }
    this.eventIdValue = id;

    // Load the event so the confirmation message is real
    this.calendarService.getByEventIds([id]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        const ev = res.events?.[0];
        if (!ev) {
          this.apiError = 'Event not found';
          return;
        }

        this.calendarId = ev.calendar_id ?? '';
        this.eventName = ev.title ?? 'Event';

        // Show friendly calendar name if we have it; otherwise show the id
        const match = this.calendars.find((c) => c.id === this.calendarId);
        this.calendarName = match?.name ?? this.calendarId ?? 'Calendar';
      },
      error: () => (this.apiError = 'Could not load event'),
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
    this.apiError = '';

    if (!this.eventIdValue) {
      this.apiError = 'Missing event id';
      return;
    }

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError = 'Not logged in (missing user id). Please sign in again.';
      return;
    }

    if (!this.calendarId) {
      this.apiError = 'Missing calendar id';
      return;
    }

    const dto: DeleteEventDTO = {
      user_id: String(userId),
      calendar_id: String(this.calendarId),
    };

    this.isDeleting = true;

    this.eventService.delete(this.eventIdValue, dto).subscribe({
      next: (deleted: boolean) => {
        this.isDeleting = false;

        if (!deleted) {
          this.apiError = 'Could not delete event';
          return;
        }

        this.eventDeleted.emit(this.eventIdValue);
        this.close.emit();
      },
      error: (err) => {
        this.isDeleting = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not delete event';
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
