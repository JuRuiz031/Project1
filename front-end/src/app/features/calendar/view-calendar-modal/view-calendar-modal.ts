import { Component, input, output, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

import { getCalendarColor } from '../../../config/calendar-colors';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

type CalendarUserRow = {
  calendar_id: string;
  user_id: string;
  username: string;
};

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

  // Used by parent to open edit-calendar-modal
  editCalendar = output<string>();

  // State
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  toast = signal('');
  inviteLink = signal('');

  // Users (list only – no admin/user tags)
  users = signal<CalendarUserRow[]>([]);
  usersError = signal('');
  isLoadingUsers = signal(false);

  // Share popup state (matches ViewEventModal pattern)
  showSharePopup = signal(false);
  shareLink = signal<string>('');
  isGeneratingLink = signal(false);
  copySuccess = signal(false);

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

      // reset users state
      this.users.set([]);
      this.usersError.set('');
      this.isLoadingUsers.set(false);

      // reset share state
      this.showSharePopup.set(false);
      this.shareLink.set('');
      this.isGeneratingLink.set(false);
      this.copySuccess.set(false);

      this.loadCalendars();
      this.loadCalendarUsers(id);
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

        const id = this.calendarId();
        if (id && !calendars.some(c => c.id === id)) {
          this.apiError.set('Calendar not found');
        }
      });
  }

  private loadCalendarUsers(calendarId: string): void {
    this.usersError.set('');
    this.isLoadingUsers.set(true);

    // Endpoint: GET /calendar?calendarIds=...
    this.calendarService
      .getByCalendarIds([calendarId])
      .pipe(
        map((res: CalendarFilterResponseDTO) => {
          const rows: CalendarUserRow[] = (res.users ?? [])
            .filter(u => String(u.calendar_id) === String(calendarId))
            .map(u => ({
              calendar_id: String(u.calendar_id),
              user_id: String(u.user_id),
              username: String(u.username ?? ''),
            }))
            .filter(u => u.user_id && u.username);

          return rows;
        }),
        catchError(err => {
          console.error('[ViewCalendarModal] Failed to load calendar users:', err);
          this.usersError.set('Could not load calendar users');
          return of([] as CalendarUserRow[]);
        })
      )
      .subscribe(rows => {
        this.isLoadingUsers.set(false);
        this.users.set(rows);
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

  // Share button flow (instead of "Generate Invite Link" button)
  onShare(): void {
    this.clearToast();

    const id = this.calendarId();
    if (!id || !this.isAdmin()) {
      this.showNotAdmin();
      return;
    }

    this.showSharePopup.set(true);
    this.isGeneratingLink.set(true);
    this.shareLink.set('');
    this.copySuccess.set(false);

    // TODO: Replace with real API call when available.
    // For now: mock link generation
    const token = Math.random().toString(36).slice(2, 10);
    const link = `https://yourapp/invite/calendars/${id}/${token}`;

    // Simulate async generation (keeps same UX as event share)
    setTimeout(() => {
      this.inviteLink.set(link);
      this.shareLink.set(link);
      this.isGeneratingLink.set(false);
    }, 400);
  }

  closeSharePopup(): void {
    this.showSharePopup.set(false);
    this.shareLink.set('');
    this.copySuccess.set(false);
  }

  copyShareLink(): void {
    const link = this.shareLink();
    if (!link) return;

    navigator.clipboard
      .writeText(link)
      .then(() => {
        this.copySuccess.set(true);
        setTimeout(() => this.copySuccess.set(false), 2000);
      })
      .catch(err => {
        console.error('[ViewCalendarModal] Failed to copy link:', err);
      });
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

  getColor(calendarId: string) {
    return getCalendarColor(calendarId);
  }
}