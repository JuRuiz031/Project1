import { Component, input, output, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarApiService } from '../../../shared/services/api/calendar-api.service';
import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };
type EventDisplay = {
  calendarId: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  notes: string;
};

@Component({
  selector: 'app-view-event-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-event-modal.html',
  styleUrls: ['./view-event-modal.css'],
})
export class ViewEventModal implements OnDestroy {
  private calendarApi = inject(CalendarApiService);
  private calendarService = inject(CalendarService);

  // Inputs & Outputs
  eventId = input<string | null>(null);
  back = output<void>();
  close = output<void>();
  editEvent = output<string>();  // Emit eventId when user wants to edit

  // State
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  event = signal<EventDisplay | null>(null);

  // Computed
  adminCalendars = computed(() => this.calendars().filter(c => c.isAdmin));
  canEdit = computed(() => {
    const e = this.event();
    if (!e) return false;
    return this.adminCalendars().some(c => c.id === e.calendarId);
  });

  constructor() {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';

    effect(() => {
      const id = this.eventId();
      if (id) {
        this.loadCalendars();
        this.loadEvent(id);
      }
    });
  }

  ngOnDestroy(): void {
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
  }

  private loadCalendars(): void {
    this.calendarService.getHomepage().pipe(
      map((home: CalendarHomeDTO) => this.mapCalendars(home.calendars ?? [])),
      tap(calendars => console.log('[ViewEventModal] Calendars loaded:', calendars)),
      catchError(err => {
        console.error('[ViewEventModal] Failed to load calendars:', err);
        return of([]);
      })
    ).subscribe(calendars => {
      this.calendars.set(calendars);
    });
  }

  private loadEvent(eventId: string): void {
    this.calendarApi.getByEventIds([eventId]).pipe(
      map((res: CalendarFilterResponseDTO) => res?.events?.[0]),
      tap(event => {
        if (!event) {
          this.apiError.set('Event not found');
        }
      }),
      catchError(() => {
        this.apiError.set('Could not load event');
        return of(null);
      })
    ).subscribe(event => {
      if (event) {
        this.displayEvent(event);
      }
    });
  }

  private mapCalendars(rawCalendars: any[]): CalendarOption[] {
    return rawCalendars
      .map((c: any) => ({
        id: String(c.calendar_id ?? c.id ?? c.calendarId ?? c._id ?? ''),
        name: String(c.name ?? c.title ?? c.calendar_name ?? 'Untitled'),
        isAdmin: c.isAdmin ?? c.is_admin ?? false,
      }))
      .filter(c => c.id);
  }

  private displayEvent(event: EventDTO): void {
    this.apiError.set('');

    const start = this.isoToDateTime(event.start_time);
    const end = this.isoToDateTime(event.end_time);

    this.event.set({
      calendarId: event.calendar_id ?? '',
      title: event.title ?? '',
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      description: event.description ?? '',
      notes: event.notes ?? '',
    });
  }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const match = iso.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (!match) return { date: '', time: '' };

    return { date: match[1], time: match[2] };
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onEditEvent(): void {
    const id = this.eventId();
    if (id) {
      this.editEvent.emit(id);
    }
  }
}
