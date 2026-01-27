import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventService } from '../../../shared/services/event.service';
import { DeleteEventDTO } from '../../../shared/models/events/delete-event.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-delete-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-event.html',
  styleUrls: ['./delete-event.css'],
})
export class DeleteEvent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);
  private eventService = inject(EventService);

  // Used for API calls
  private eventId = '';
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

    const id = this.route.snapshot.paramMap.get('eventId');
    if (!id) {
      this.apiError = 'Missing event id';
      return;
    }
    this.eventId = id;

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

    if (!this.eventId) {
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

    this.eventService.delete(this.eventId, dto).subscribe({
      next: (deleted: boolean) => {
        this.isDeleting = false;

        if (!deleted) {
          this.apiError = 'Could not delete event';
          return;
        }

        this.router.navigateByUrl('/main-page');
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

  cancel(): void {
    // keep it simple; if you have /edit-event/:eventId route you can change this later
    this.router.navigateByUrl('/edit-event');
  }
}
