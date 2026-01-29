import { Component, OnInit, DestroyRef, signal, computed, effect, inject } from '@angular/core';
import { map, catchError, tap, take } from 'rxjs/operators';
import { of, interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
import { CreateCalendarModal } from '../../calendar/create-calendar-modal/create-calendar-modal';
import { CalendarSelectorModal } from '../../calendar/calendar-selector-modal/calendar-selector-modal';
import { ViewCalendarModal } from '../../calendar/view-calendar-modal/view-calendar-modal';
import { EditCalendarModal } from '../../calendar/edit-calendar-modal/edit-calendar-modal';
import { DeleteCalendarModal } from '../../calendar/delete-calendar-modal/delete-calendar-modal';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

type CalendarOptionDTO = { calendar_id: string; name: string };

type ModalState =
  | 'none'
  | 'create-calendar'
  | 'event-selector'
  | 'view-event'
  | 'create-event'
  | 'edit-event'
  | 'delete-event'
  | 'calendar-selector'
  | 'view-calendar'
  | 'edit-calendar'
  | 'delete-calendar'
  | 'create-poll';

@Component({
  selector: 'app-main-page',
  standalone: true,

    imports: [
    CalendarDisplay,
    CalendarOptions,
    DisplayOptions,
    PollsWindow,
    EventSelectorModal,
    ViewEventModal,
    CreateEventModal,
    EditEventModal,
    DeleteEventModal,
    CreateCalendarModal,
    CalendarSelectorModal,
    ViewCalendarModal,
    EditCalendarModal,
    DeleteCalendarModal,
    CreatePollModal,
  ],
  
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private destroyRef = inject(DestroyRef);

  // Signals for reactive state
  calendars = signal<CalendarOptionDTO[]>([]);
  tags = signal<string[]>([]);
  events = signal<any[]>([]);
  polls = signal<any[]>([]);
  selectedCalendarIds = signal<string[]>([]);
  selectedCalendarId = signal<string | null>(null);
  selectedTags = signal<string[]>([]);

  // Modal state machine
  modalState = signal<ModalState>('none');
  selectedEventId = signal<string | null>(null);
  showEventSuccessMessage = signal(false);

  // User info
  userId: string | null = null;
  currentUserId = computed(() => this.userId ?? '');

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

    // Refresh events when user returns to tab (prevents stale data)
    window.addEventListener('focus', this.handleWindowFocus);

    // Poll every 30 seconds while page is active (keeps data fresh)
    interval(30000)
      .pipe(
        tap(() => {
          if (this.selectedCalendarIds().length > 0) {
            console.log('[MainPage] Auto-refresh (30s polling)');
            this.refreshEvents();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Register cleanup on component destroy
    this.destroyRef.onDestroy(() => {
      console.log('[MainPage] Component destroyed - cleaning up resources');
      window.removeEventListener('focus', this.handleWindowFocus);
    });
  }

  /**
   * Refresh events when user returns to the tab
   */
  private handleWindowFocus = (): void => {
    if (this.selectedCalendarIds().length > 0) {
      console.log('[MainPage] Window focused - refreshing events');
      this.refreshEvents();
    }
  };

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
   * Handle calendar created - reload calendar list
   */
  onCalendarCreated(calendarId: string): void {
    console.log('[MainPage] Calendar created:', calendarId);

    // refresh right-side options + tag list
    this.loadCalendarHome();

    // ensure new calendar is selected (keeps same "end state" as page redirect)
    const current = this.selectedCalendarIds();
    if (!current.includes(calendarId)) {
      this.selectedCalendarIds.set([...current, calendarId]);
    } else {
      this.selectedCalendarIds.set([...current]);
    }
  }

  openCalendarSelector(): void {
    console.log('[MainPage] Opening calendar selector modal');
    this.modalState.set('calendar-selector');
  }

  onCalendarActivated(calendarId: string): void {
    console.log('[MainPage] Calendar activated (double-click):', calendarId);
    this.selectedCalendarId.set(calendarId);
    this.modalState.set('view-calendar');
  }

  onViewCalendarBack(): void {
    console.log('[MainPage] Back from view-calendar');
    this.modalState.set('calendar-selector');
  }

  openEditCalendar(calendarId: string): void {
    console.log('[MainPage] Opening edit calendar modal:', calendarId);
    this.selectedCalendarId.set(calendarId);
    this.modalState.set('edit-calendar');
  }

  openDeleteCalendar(calendarId: string): void {
    console.log('[MainPage] Opening delete calendar modal:', calendarId);
    this.selectedCalendarId.set(calendarId);
    this.modalState.set('delete-calendar');
  }

  // Delete-calendar modal state
  deleteCalendarApiError = signal('');
  isDeletingCalendar = signal(false);

  selectedCalendarName = computed(() => {
    const id = this.selectedCalendarId();
    if (!id) return 'this calendar';

    const found = this.calendars().find(c => String(c.calendar_id) === String(id));
    return found?.name ?? 'this calendar';
  });

  onConfirmDeleteCalendar(calendarId: string): void {
    this.deleteCalendarApiError.set('');
    this.isDeletingCalendar.set(true);

    // assuming CalendarService has delete(calendarId) like update()
    this.calendarService.delete(calendarId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isDeletingCalendar.set(false);

          // refresh calendar list + close
          this.loadCalendarHome();
          this.closeAllModals();
        },
        error: (err) => {
          this.isDeletingCalendar.set(false);
          this.deleteCalendarApiError.set(
            err?.error?.message ||
              (typeof err?.error === 'string' ? err.error : '') ||
              err?.message ||
              'Could not delete calendar'
          );
        },
      });
  }

  onCalendarUpdated(calendarId: string): void {
    console.log('[MainPage] Calendar updated:', calendarId);
    this.loadCalendarHome(); // refresh calendar list names
    this.closeAllModals();
  }

  onDeleteCalendarRequested(calendarId: string): void {
    console.log('[MainPage] Delete calendar requested:', calendarId);
    this.openDeleteCalendar(calendarId);
  }

  /**
   * Handle tag selection changes from DisplayOptions
   */
  onSelectedTagsChange(tags: string[]): void {
    console.log('[MainPage] selectedTagsChange received:', tags);
    this.selectedTags.set(tags);
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
    this.selectedCalendarId.set(null);
    this.showEventSuccessMessage.set(false);
  }

  /**
   * Open create calendar modal
   */
  openCreateCalendar(): void {
    console.log('[MainPage] Opening create calendar modal');
    this.modalState.set('create-calendar');
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
   * Handle event updated - refresh and show view modal
   */
  onEventUpdated(eventId: string): void {
    console.log('[MainPage] Event updated:', eventId);
    this.refreshEvents();
    this.selectedEventId.set(eventId);
    this.showEventSuccessMessage.set(true);
    this.modalState.set('view-event');
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
