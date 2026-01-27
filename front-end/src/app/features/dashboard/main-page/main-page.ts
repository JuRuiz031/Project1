import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CalendarDisplay } from './components/calendar-display/calendar-display';
import { CalendarOptions } from './components/calendar-options/calendar-options';
import { DisplayOptions } from './components/display-options/display-options';
import { PollsWindow } from './components/polls-window/polls-window';

import { CalendarService } from '../../../shared/services/calendar.service';

type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CalendarDisplay, CalendarOptions, DisplayOptions, PollsWindow],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent implements OnInit {
  // Session anchor
  userId!: string;

  // MainPage-owned data
  calendars: CalendarOptionDTO[] = [];
  events: any[] = [];
  polls: any[] = [];
  tags: string[] = [];

  // MainPage-owned view state
  selectedCalendarIds: string[] = [];
  viewMode: 'week' | 'month' = 'week';
  viewRange: { start: Date; end: Date } | null = null;

  constructor(private calendarService: CalendarService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('[MainPage] ngOnInit fired');

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token) console.log('[MainPage] Token exists in localStorage:', token);
    else console.log('[MainPage] No token found in localStorage');

    if (userString) console.log('[MainPage] User string in localStorage:', userString);
    else console.log('[MainPage] No user string found in localStorage');

    this.loadMainPage();
  }

  private loadMainPage(): void {
    console.log('[MainPage] loadMainPage() invoked');

    const userString = localStorage.getItem('user');
    if (!userString) {
      console.warn('[MainPage] loadMainPage(): no user string found');
      return;
    }

    // Parse user safely and extract user_id (string OR number)
    try {
      const parsed = JSON.parse(userString) as { user_id?: string | number };

      if (parsed.user_id === undefined || parsed.user_id === null) {
        console.error('[MainPage] user_id missing in user string:', parsed);
        return;
      }

      this.userId = String(parsed.user_id);
      console.log('[MainPage] Active user_id set:', this.userId);
    } catch (err) {
      console.error('[MainPage] Failed to parse user JSON', err);
      return;
    }

    // Initialize page-owned state
    this.calendars = [];
    this.events = [];
    this.polls = [];
    this.tags = [];

    // Initialize view state defaults
    this.selectedCalendarIds = [];
    this.viewMode = 'week';
    this.viewRange = null;

    console.log('[MainPage] Initial main-page state set', {
      userId: this.userId,
      calendars: this.calendars,
      events: this.events,
      polls: this.polls,
      tags: this.tags,
      selectedCalendarIds: this.selectedCalendarIds,
      viewMode: this.viewMode,
      viewRange: this.viewRange,
    });

    // ✅ CALL: GET /calendar (calendar homepage)
    console.log('[MainPage] Calling CalendarService.getHomepage() (GET /calendar)...');

    this.calendarService.getHomepage().subscribe({
      next: (home: any) => {
        console.log('[MainPage] ✅ getHomepage() SUCCESS');
        console.log('[MainPage] CalendarHomeDTO received:', home);

        // ✅ Map whatever homepage returns into DisplayOptions shape
        const rawCalendars = home.calendars ?? [];
        this.calendars = rawCalendars.map((c: any) => ({
          calendar_id: String(
            c.calendar_id ?? c.id ?? c.calendarId ?? c._id ?? ''
          ),
          name: String(c.name ?? c.title ?? c.calendar_name ?? 'Untitled'),
        })).filter((c: CalendarOptionDTO) => c.calendar_id);

        this.tags = (home.tags ?? []).map((t: any) => String(t));

        console.log('[MainPage] Stored state:', {
          calendars: this.calendars,
          tags: this.tags,
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('[MainPage] ❌ getHomepage() FAILED', err);
      },
    });
  }

  onSelectedCalendarIdsChange(ids: string[]): void {
    console.log('[MainPage] selectedCalendarIdsChange received:', ids);

    this.selectedCalendarIds = ids;

    // ✅ Guard: if nothing selected, clear and stop
    if (!ids || ids.length === 0) {
      this.events = [];
      this.polls = [];
      console.log('[MainPage] No calendars selected → cleared events/polls');
      return;
    }

    // Optional: immediately fetch events/polls for selected calendars
    this.calendarService.getByCalendarIds(ids).subscribe({
      next: (filtered: any) => {
        this.events = filtered.events ?? [];
        this.polls = filtered.polls ?? [];

        console.log('[MainPage] ✅ getByCalendarIds() SUCCESS');
        console.log('[MainPage] Filtered calendar data received:', filtered);
      },
      error: (err: any) => {
        console.error('[MainPage] ❌ getByCalendarIds() FAILED', err);
      },
    });
  }
}
