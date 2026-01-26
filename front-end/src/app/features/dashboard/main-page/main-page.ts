import { Component, OnInit } from '@angular/core';

import { CalendarDisplay } from './components/calendar-display/calendar-display';
import { CalendarOptions } from './components/calendar-options/calendar-options';
import { DisplayOptions } from './components/display-options/display-options';
import { PollsWindow } from './components/polls-window/polls-window';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CalendarDisplay,
    CalendarOptions,
    DisplayOptions,
    PollsWindow,
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent implements OnInit {

  // Session anchor
  userId!: string;

  // MainPage-owned data (blank for now)
  calendars: any[] = [];
  events: any[] = [];
  polls: any[] = [];
  tags: any[] = [];

  // MainPage-owned view state (blank/default for now)
  selectedCalendarIds: string[] = [];
  viewMode: 'week' | 'month' = 'week';
  viewRange: { start: Date; end: Date } | null = null;

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

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token) console.warn('[MainPage] loadMainPage(): no token found');

    if (!userString) {
      console.warn('[MainPage] loadMainPage(): no user string found');
      return;
    }

    // Parse user safely and extract user_id
    try {
      const parsed = JSON.parse(userString) as { user_id?: string };

      if (!parsed.user_id) {
        console.error('[MainPage] user_id missing in user string:', parsed);
        return;
      }

      this.userId = parsed.user_id;
      console.log('[MainPage] Active user_id set:', this.userId);

    } catch (err) {
      console.error('[MainPage] Failed to parse user JSON', err);
      return;
    }

    // Initialize page-owned state (intentionally empty)
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
  }
}
