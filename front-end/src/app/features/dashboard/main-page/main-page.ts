import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarDisplay } from './components/calendar-display/calendar-display';
import { CalendarOptions } from './components/calendar-options/calendar-options';
import { DisplayOptions } from './components/display-options/display-options';
import { PollsWindow } from './components/polls-window/polls-window';
import { EventSelectorModal } from './components/event-selector-modal/event-selector-modal';
import { ViewEventModal } from '../../event/view-event-modal/view-event-modal';
import { CreateEventModal } from '../../event/create-event-modal/create-event-modal';
import { EditEventModal } from '../../event/edit-event-modal/edit-event-modal';
import { DeleteEventModal } from '../../event/delete-event-modal/delete-event-modal';
import { CreatePollModal } from '../../poll/create-poll-modal/create-poll-modal';


import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

type CalendarOptionDTO = { calendar_id: string; name: string };
type ModalState = 'none' | 'event-selector' | 'view-event' | 'create-event' | 'edit-event' | 'delete-event' | 'create-poll';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CalendarDisplay, CalendarOptions, DisplayOptions, PollsWindow, EventSelectorModal, ViewEventModal, CreateEventModal, EditEventModal, DeleteEventModal, CreatePollModal],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent implements OnInit {
  private calendarService = inject(CalendarService);

  // Signals for reactive state
  calendars = signal<CalendarOptionDTO[]>([]);
  tags = signal<string[]>([]);
  events = signal<any[]>([]);
  polls = signal<any[]>([]);
  selectedCalendarIds = signal<string[]>([]);

  // Modal state machine
  modalState = signal<ModalState>('none');
  selectedEventId = signal<string | null>(null);

  // User info
  userId: string | null = null;

  constructor() {
    // Effect: react to calendar selection changes
    effect(() => {
      const ids = this.selectedCalendarIds();
      const calendars = this.calendars();
      
      if (!ids || ids.length === 0) {
        console.log('[MainPage] No calendars selected -> cleared events/polls');
        this.events.set([]);
        this.polls.set([]);
        return;
      }

      console.log('[MainPage] Fetching events for calendars:', ids);
      this.calendarService.getByCalendarIds(ids).pipe(
        map((filtered: CalendarFilterResponseDTO) => ({
          events: (filtered.events ?? []).map(e => {
            // Add calendar name to event based on calendar_id
            const calendar = calendars.find(c => c.calendar_id === e.calendar_id);
            return { ...e, calendar_name: calendar?.name || 'Unknown' };
          }),
          polls: filtered.polls ?? []
        })),
        tap(data => console.log('[MainPage] Filtered data loaded:', data)),
        catchError(err => {
          console.error('[MainPage] getByCalendarIds() FAILED', err);
          return of({ events: [], polls: [] });
        })
      ).subscribe(data => {
        this.events.set(data.events);
        this.polls.set(data.polls);
      });
    });
  }

  ngOnInit(): void {
    console.log('[MainPage] ngOnInit fired');

    // Parse user from localStorage
    this.userId = this.parseUserId();
    if (!this.userId) {
      console.warn('[MainPage] No valid user found in localStorage');
      return;
    }

    console.log('[MainPage] Active user_id:', this.userId);

    // Load calendar home data
    this.loadCalendarHome();
  }

  /**
   * Load calendar home (calendars + tags)
   */
  private loadCalendarHome(): void {
    console.log('[MainPage] Calling CalendarService.getHomepage()...');
    
    this.calendarService.getHomepage().pipe(
      map((home: CalendarHomeDTO) => ({
        calendars: this.mapCalendars(home.calendars ?? []),
        tags: (home.tags ?? []).map(t => String(t))
      })),
      tap(data => console.log('[MainPage] Calendar home loaded:', data)),
      catchError(err => {
        console.error('[MainPage] getHomepage() FAILED', err);
        return of({ calendars: [], tags: [] });
      })
    ).subscribe(data => {
      this.calendars.set(data.calendars);
      this.tags.set(data.tags);
    });
  }

  /**
   * Parse user ID from localStorage
   */
  private parseUserId(): string | null {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    try {
      const parsed = JSON.parse(userString) as { user_id?: string | number };
      return parsed.user_id ? String(parsed.user_id) : null;
    } catch {
      return null;
    }
  }

  /**
   * Map backend calendar data to DisplayOptions format
   */
  private mapCalendars(rawCalendars: any[]): CalendarOptionDTO[] {
    return rawCalendars
      .map((c: any) => ({
        calendar_id: String(c.calendar_id ?? c.id ?? c.calendarId ?? c._id ?? ''),
        name: String(c.name ?? c.title ?? c.calendar_name ?? 'Untitled')
      }))
      .filter(c => c.calendar_id);
  }

  /**
   * Handle calendar selection changes from DisplayOptions
   */
  onSelectedCalendarIdsChange(ids: string[]): void {
    console.log('[MainPage] selectedCalendarIdsChange received:', ids);
    this.selectedCalendarIds.set(ids);
  }

  /**
   * Open event selector modal
   */
  openEventSelector(): void {
    this.modalState.set('event-selector');
  }

  /**
   * When user clicks on event directly in calendar (not from selector)
   */
  onEventClicked(eventId: string): void {
    console.log('[MainPage] Event clicked from calendar:', eventId);
    this.selectedEventId.set(eventId);
    this.modalState.set('view-event');
  }

  /**
   * When user selects an event from the selector
   */
  onEventSelected(eventId: string): void {
    console.log('[MainPage] Event selected from modal:', eventId);
    this.selectedEventId.set(eventId);
    this.modalState.set('view-event');
  }

  /**
   * Back button in view-event modal
   */
  onViewEventBack(): void {
    console.log('[MainPage] Back from view-event');
    this.modalState.set('event-selector');
  }

  /**
   * Close all modals
   */
  closeAllModals(): void {
    console.log('[MainPage] Closing all modals');
    this.modalState.set('none');
    this.selectedEventId.set(null);
  }

  /**
   * Open create event modal
   */
  openCreateEvent(): void {
    console.log('[MainPage] Opening create event modal');
    this.modalState.set('create-event');
  }

  /**
   * Open edit event modal
   */
  openEditEvent(eventId: string): void {
    console.log('[MainPage] Opening edit event modal:', eventId);
    this.selectedEventId.set(eventId);
    this.modalState.set('edit-event');
  }

  /**
   * Open delete event modal
   */
  openDeleteEvent(eventId: string): void {
    console.log('[MainPage] Opening delete event modal:', eventId);
    this.selectedEventId.set(eventId);
    this.modalState.set('delete-event');
  }

  /**
   * Handle event created - refresh and close
   */
  onEventCreated(eventId: string): void {
    console.log('[MainPage] Event created:', eventId);
    this.refreshEvents();
  }

  /**
   * Handle event updated - refresh and close
   */
  onEventUpdated(eventId: string): void {
    console.log('[MainPage] Event updated:', eventId);
    this.refreshEvents();
  }

  /**
   * Handle event deleted - refresh and close
   */
  onEventDeleted(eventId: string): void {
    console.log('[MainPage] Event deleted:', eventId);
    this.refreshEvents();
  }

  /**
   * Handle delete requested from edit modal
   */
  onDeleteRequested(eventId: string): void {
    console.log('[MainPage] Delete requested from edit modal:', eventId);
    this.openDeleteEvent(eventId);
  }

  /**
   * Refresh events by triggering the effect that loads events
   */
  private refreshEvents(): void {
    console.log('[MainPage] Refreshing events...');
    // Trigger the effect by re-setting the selected calendar IDs
    const currentIds = this.selectedCalendarIds();
    this.selectedCalendarIds.set([...currentIds]);
  }

  openCreatePoll(): void {
    console.log('[MainPage] Opening create poll modal');
    this.modalState.set('create-poll');
  }

  onPollCreated(pollId: string): void {
    console.log('[MainPage] Poll created:', pollId);
    this.refreshPolls();
  }

  private refreshPolls(): void {
    console.log('[MainPage] Refreshing polls...');
    const currentIds = this.selectedCalendarIds();
    this.selectedCalendarIds.set([...currentIds]);
  }



}
