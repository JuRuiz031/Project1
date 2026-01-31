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
import { PollSelectorModal } from '../../poll/poll-selector-modal/poll-selector-modal';
import { ViewPollModal } from '../../poll/view-poll-modal/view-poll-modal';
import { EditPollModal } from '../../poll/edit-poll-modal/edit-poll-modal';
import { DeletePollModal } from '../../poll/delete-poll-modal/delete-poll-modal';
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
  | 'create-poll'
  | 'poll-selector'
  | 'view-poll'
  | 'edit-poll'
  | 'delete-poll';

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
    PollSelectorModal,
    ViewPollModal,
    EditPollModal,
    DeletePollModal,
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
  selectedPollId = signal<string | null>(null);

  // Delete confirmation overlay (shown on top of edit modal)
  showDeleteEventOverlay = signal(false);
  showDeletePollOverlay = signal(false);
  
  // Track where user came from for navigation after deletion
  cameFromEventSelector = signal(false);
  cameFromPollSelector = signal(false);

  // Toast notification for main page
  showToast = signal(false);
  toastMessage = signal('');
  private toastTimeout: any = null;

  // User info
  userId: string | null = null;
  currentUserId = computed(() => this.userId ?? '');

  constructor() {
    // Effect: react to calendar selection changes
    effect(() => {
      const ids = this.selectedCalendarIds();
      const calendars = this.calendars();
      
      // If no calendars selected, fetch ALL calendars (show everything)
      // If calendars selected, fetch only those calendars
      const calendarIdsToFetch = (ids && ids.length > 0) 
        ? ids 
        : calendars.map(c => c.calendar_id);
      
      if (calendarIdsToFetch.length === 0) {
        console.log('[MainPage] No calendars available -> cleared events/polls');
        this.events.set([]);
        this.polls.set([]);
        return;
      }

      console.log('[MainPage] Fetching events for calendars:', calendarIdsToFetch);
      this.calendarService.getByCalendarIds(calendarIdsToFetch).pipe(
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
        tags: (home.tags ?? []).map(t => String(t)).sort((a, b) => a.localeCompare(b))
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
      .filter(c => c.calendar_id)
      .sort((a, b) => a.name.localeCompare(b.name));
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
    
    this.showToastNotification('Calendar created successfully!');
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
          this.showToastNotification('Calendar deleted successfully!');
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
    this.showToastNotification('Calendar updated successfully!');
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
    this.cameFromEventSelector.set(false);
    this.selectedEventId.set(eventId);
    this.modalState.set('view-event');
  }

  /**
   * When user clicks on poll directly in calendar
   */
  onPollClicked(pollId: string): void {
    console.log('[MainPage] Poll clicked from calendar:', pollId);
    this.cameFromPollSelector.set(false);
    this.selectedPollId.set(pollId);
    this.modalState.set('view-poll');
  }

  /**
   * When user selects an event from the selector
   */
  onEventSelected(eventId: string): void {
    console.log('[MainPage] Event selected from modal:', eventId);
    this.cameFromEventSelector.set(true);
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
   * Back button in view-poll modal
   */
  onViewPollBack(): void {
    console.log('[MainPage] Back from view-poll');
    this.modalState.set('poll-selector');
  }

  /**
   * Close all modals
   */
  closeAllModals(): void {
    console.log('[MainPage] Closing all modals');
    this.modalState.set('none');
    this.selectedEventId.set(null);
    this.selectedCalendarId.set(null);
    this.selectedPollId.set(null);
    this.showDeleteEventOverlay.set(false);
    this.showDeletePollOverlay.set(false);
    this.cameFromEventSelector.set(false);
    this.cameFromPollSelector.set(false);
  }

  /**
   * Show a toast notification on the main page
   */
  showToastNotification(message: string, duration: number = 4000): void {
    // Clear any existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toastMessage.set(message);
    this.showToast.set(true);
    
    // Auto-dismiss after duration
    this.toastTimeout = setTimeout(() => {
      this.dismissToast();
    }, duration);
  }

  /**
   * Dismiss the toast notification
   */
  dismissToast(): void {
    this.showToast.set(false);
    this.toastMessage.set('');
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
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
   * Open delete event overlay (on top of edit modal)
   */
  openDeleteEvent(eventId: string): void {
    console.log('[MainPage] Opening delete event overlay:', eventId);
    this.selectedEventId.set(eventId);
    this.showDeleteEventOverlay.set(true);
  }

  /**
   * Close just the delete event overlay (cancel)
   */
  closeDeleteEventOverlay(): void {
    console.log('[MainPage] Closing delete event overlay');
    this.showDeleteEventOverlay.set(false);
  }

  /**
   * Handle event created - refresh and close
   */
  onEventCreated(eventId: string): void {
    console.log('[MainPage] Event created:', eventId);
    this.loadCalendarHome();
    this.refreshEvents();
  }

  /**
   * Handle event updated - refresh and show toast
   */
  onEventUpdated(eventId: string): void {
    console.log('[MainPage] Event updated:', eventId);
    this.loadCalendarHome();
    this.refreshEvents();
    this.closeAllModals();
    this.showToastNotification('Event updated successfully!');
  }

  /**
   * Handle event deleted - show toast and navigate back
   */
  onEventDeleted(eventId: string): void {
    console.log('[MainPage] Event deleted:', eventId);
    this.showDeleteEventOverlay.set(false);
    this.selectedEventId.set(null);
    
    // Navigate based on where user came from
    if (this.cameFromEventSelector()) {
      this.modalState.set('event-selector');
    } else {
      this.modalState.set('none');
    }
    
    this.showToastNotification('Event deleted successfully!');
    this.loadCalendarHome();
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
    this.loadCalendarHome();
    this.refreshPolls();
  }

  openPollSelector(): void {
    console.log('[MainPage] Opening poll selector modal');
    this.modalState.set('poll-selector');
  }

  onPollSelected(pollId: string): void {
    console.log('[MainPage] Poll selected:', pollId);
    this.cameFromPollSelector.set(true);
    this.selectedPollId.set(pollId);
    this.modalState.set('view-poll');
  }

  onViewPollFromList(pollId: string): void {
    console.log('[MainPage] Opening poll directly:', pollId);
    this.cameFromPollSelector.set(false);
    this.selectedPollId.set(pollId);
    this.modalState.set('view-poll');
  }

  openEditPoll(pollId: string): void {
    console.log('[MainPage] Opening edit poll modal:', pollId);
    this.selectedPollId.set(pollId);
    this.modalState.set('edit-poll');
  }

  onPollUpdated(pollId: string): void {
    console.log('[MainPage] Poll updated:', pollId);
    this.closeAllModals();
    this.showToastNotification('Poll updated successfully!');
    this.loadCalendarHome();
    this.refreshPolls();
  }

  /**
   * Open delete poll overlay (on top of edit modal)
   */
  openDeletePoll(pollId: string): void {
    console.log('[MainPage] Opening delete poll overlay:', pollId);
    this.selectedPollId.set(pollId);
    this.showDeletePollOverlay.set(true);
  }

  /**
   * Close just the delete poll overlay (cancel)
   */
  closeDeletePollOverlay(): void {
    console.log('[MainPage] Closing delete poll overlay');
    this.showDeletePollOverlay.set(false);
  }

  /**
   * Handle poll deleted - show toast and navigate back
   */
  onPollDeleted(pollId: string): void {
    console.log('[MainPage] Poll deleted:', pollId);
    this.showDeletePollOverlay.set(false);
    this.selectedPollId.set(null);
    
    // Navigate based on where user came from
    if (this.cameFromPollSelector()) {
      this.modalState.set('poll-selector');
    } else {
      this.modalState.set('none');
    }
    
    this.showToastNotification('Poll deleted successfully!');
    this.loadCalendarHome();
    this.refreshPolls();
  }

  private refreshPolls(): void {
    console.log('[MainPage] Refreshing polls...');
    const currentIds = this.selectedCalendarIds();
    this.selectedCalendarIds.set([...currentIds]);
  }



}
