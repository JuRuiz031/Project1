import { Component, input, output, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, catchError, tap, take } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarApiService } from '../../../shared/services/api/calendar-api.service';
import { CalendarService } from '../../../shared/services/calendar.service';
import { InviteService } from '../../../shared/services/invite.service';
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
  tags: string[];
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
  private inviteService = inject(InviteService);

  // Inputs & Outputs
  eventId = input<string | null>(null);
  back = output<void>();
  close = output<void>();
  editEvent = output<string>();
  showSuccessMessage = input<boolean>(false);

  // State
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  event = signal<EventDisplay | null>(null);
  showNotification = signal(false);
  showSharePopup = signal(false);
  shareLink = signal<string>('');
  isGeneratingLink = signal(false);
  copySuccess = signal(false);

  // Computed
  adminCalendars = computed(() => this.calendars().filter(c => c.isAdmin));
  canEdit = computed(() => {
    const e = this.event();
    if (!e) return false;
    return this.adminCalendars().some(c => c.id === e.calendarId);
  });

  constructor() {
    document.body.style.overflow = 'hidden';

    effect(() => {
      const id = this.eventId();
      if (id) {
        this.loadCalendars();
        this.loadEvent(id);
      }
      
      // Show notification if success message is true
      const showSuccess = this.showSuccessMessage();
      if (showSuccess) {
        this.showNotification.set(true);
        setTimeout(() => this.showNotification.set(false), 3000);
      }
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private loadCalendars(): void {
    this.calendarService
      .getHomepage()
      .pipe(
        take(1),
        map((home: CalendarHomeDTO) => this.mapCalendars(home.calendars ?? [])),
        tap(calendars => console.log('[ViewEventModal] Calendars loaded:', calendars)),
        catchError(err => {
          console.error('[ViewEventModal] Failed to load calendars:', err);
          return of([]);
        })
      )
      .subscribe(calendars => {
        this.calendars.set(calendars);
      });
  }

  private loadEvent(eventId: string): void {
    this.apiError.set('');

    this.calendarApi
      .getByEventIds([eventId])
      .pipe(
        take(1),
        map((res: CalendarFilterResponseDTO) => res?.events?.[0]),
        tap(ev => {
          if (!ev) this.apiError.set('Event not found');
        }),
        catchError(err => {
          console.error('[ViewEventModal] Failed to load event:', err);
          this.apiError.set('Could not load event');
          return of(null);
        })
      )
      .subscribe(ev => {
        if (ev) this.displayEvent(ev);
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

  private displayEvent(ev: EventDTO): void {
    this.apiError.set('');

    const start = this.isoToDateTime(ev.start_time);
    const end = this.isoToDateTime(ev.end_time);

    this.event.set({
      calendarId: ev.calendar_id ?? '',
      title: ev.title ?? '',
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      description: ev.description ?? '',
      notes: ev.notes ?? '',
      tags: ev.tags ?? [],
    });
  }

  private parseServerInstant(iso: string): Date {
    // If server includes timezone (Z or ±hh:mm), Date can parse safely.
    // If not, assume server meant UTC and append 'Z'.
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`; // LOCAL time
    return { date, time };
  }

  getTimezoneAbbr(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value ?? 'UTC';
  }

  onShare(): void {
    const eventId = this.eventId();
    if (!eventId || !this.canEdit()) return;

    // Show popup and start generating link
    this.showSharePopup.set(true);
    this.isGeneratingLink.set(true);
    this.shareLink.set('');
    this.copySuccess.set(false);

    // Generate expiration date (7 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    const expirationISO = expirationDate.toISOString();

    // Create invite link
    this.inviteService.createEventInvite(eventId, expirationISO)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.shareLink.set(response.invite_link);
          this.isGeneratingLink.set(false);
        },
        error: (err) => {
          console.error('[ViewEventModal] Failed to generate invite link:', err);
          this.isGeneratingLink.set(false);
          this.apiError.set('Failed to generate invite link');
          this.showSharePopup.set(false);
        }
      });
  }

  closeSharePopup(): void {
    this.showSharePopup.set(false);
    this.shareLink.set('');
    this.copySuccess.set(false);
  }

  copyShareLink(): void {
    const link = this.shareLink();
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }).catch(err => {
      console.error('[ViewEventModal] Failed to copy link:', err);
    });
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onEditEvent(): void {
    const id = this.eventId();
    if (id) this.editEvent.emit(id);
  }
}
