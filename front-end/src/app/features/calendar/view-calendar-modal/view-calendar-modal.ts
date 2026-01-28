import { Component, input, output, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-view-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-calendar-modal.html',
  styleUrl: './view-calendar-modal.css',
})
export class ViewCalendarModal implements OnDestroy {
  private calendarService = inject(CalendarService);

  calendarId = input<string | null>(null);

  back = output<void>();
  close = output<void>();

  // This will be used later by MainPage to switch to edit-calendar-modal (which doesn't exist yet)
  editCalendar = output<string>();

  // State
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  toast = signal(''); // click message for non-admin actions
  inviteLink = signal('');

  // Current calendar
  currentCalendar = computed(() => {
    const id = this.calendarId();
    if (!id) return null;
    return this.calendars().find(c => c.id === id) ?? null;
  });

  isAdmin = computed(() => !!this.currentCalendar()?.isAdmin);

  constructor() {
    document.body.style.overflow = 'hidden';

    effect(() => {
      const id = this.calendarId();
      if (!id) return;

      // reset per-calendar state
      this.apiError.set('');
      this.toast.set('');
      this.inviteLink.set('');

      this.loadCalendars();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private loadCalendars(): void {
    this.calendarService
      .getHomepage()
      .pipe(
        map((home: CalendarHomeDTO) => this.mapCalendars(home?.calendars ?? [])),
        tap(calendars => console.log('[ViewCalendarModal] Calendars loaded:', calendars)),
        catchError(err => {
          console.error('[ViewCalendarModal] Failed to load calendars:', err);
          this.apiError.set('Could not load calendars');
          return of([]);
        })
      )
      .subscribe(calendars => {
        this.calendars.set(calendars);

        // If the calendarId isn't in the list, surface it
        const id = this.calendarId();
        if (id && !calendars.some(c => c.id === id)) {
          this.apiError.set('Calendar not found');
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

  // Admin-gated actions
  onEditCalendar(): void {
    this.clearToast();

    const id = this.calendarId();
    if (!id) return;

    if (!this.isAdmin()) {
      this.showNotAdmin();
      return;
    }

    this.editCalendar.emit(id);
  }

  onGenerateInviteLink(): void {
    this.clearToast();

    const id = this.calendarId();
    if (!id) return;

    if (!this.isAdmin()) {
      this.showNotAdmin();
      return;
    }

    // TODO: Replace with real API call:
    // GET /calendars/{id}/invite
    // For now: mock link generation like ViewCalendarGroup
    const token = Math.random().toString(36).slice(2, 10);
    this.inviteLink.set(`https://yourapp/invite/calendars/${id}/${token}`);
  }

  private showNotAdmin(): void {
    this.toast.set('You are not an admin of this calendar.');
  }

  private clearToast(): void {
    this.toast.set('');
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}