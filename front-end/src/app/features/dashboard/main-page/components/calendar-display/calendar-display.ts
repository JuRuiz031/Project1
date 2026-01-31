import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';

import { CalendarWidget } from './calendar-widget/calendar-widget';
import { getCalendarColor } from '../../../../../config/calendar-colors';

type EventDTO = {
  event_id: string;
  calendar_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  notes?: string;
  tags: string[];
};

type PollDTO = {
  poll_id: string;
  calendar_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  notes?: string;
  tags: string[];
};

type CalendarFilter = 'all' | 'events' | 'polls';

@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [CommonModule, CalendarWidget],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay implements OnInit {
  viewDate = new Date();

  events = input<EventDTO[]>([]);
  polls = input<PollDTO[]>([]);
  selectedTags = input<string[]>([]);
  openEventSelector = output<void>();
  eventClicked = output<string>();  // Emit event ID when user clicks on event
  pollClicked = output<string>();  // Emit poll ID when user clicks on poll
  createEvent = output<void>();  // Emit when user wants to create event

  private readonly STORAGE_KEY = 'calendar_view_date';

  // Calendar display filter state
  calendarFilter = signal<CalendarFilter>('all');

  // Computed counts for filter tabs
  eventsCount = computed(() => {
    const tags = this.selectedTags();
    let filteredEvents = this.events();
    if (tags && tags.length > 0) {
      filteredEvents = filteredEvents.filter(e =>
        tags.some(tag => e.tags?.includes(tag))
      );
    }
    return filteredEvents.length;
  });

  pollsCount = computed(() => {
    const tags = this.selectedTags();
    let filteredPolls = this.polls();
    if (tags && tags.length > 0) {
      filteredPolls = filteredPolls.filter(p =>
        tags.some(tag => p.tags?.includes(tag))
      );
    }
    return filteredPolls.length;
  });

  totalCount = computed(() => this.eventsCount() + this.pollsCount());

  ngOnInit(): void {
    // Restore viewDate from localStorage
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.viewDate = new Date(saved);
      } catch {
        this.viewDate = new Date();
      }
    }
  }

  calendarEvents = computed(() => {
    let filteredEvents = this.events();
    let filteredPolls = this.polls();
    
    // Filter by selected tags (events must have AT LEAST ONE selected tag)
    const tags = this.selectedTags();
    if (tags && tags.length > 0) {
      filteredEvents = filteredEvents.filter(e =>
        tags.some(tag => e.tags?.includes(tag))
      );
      filteredPolls = filteredPolls.filter(p =>
        tags.some(tag => p.tags?.includes(tag))
      );
    }
    
    // Apply calendar display filter (All/Events/Polls)
    const calendarFilter = this.calendarFilter();
    const includeEvents = calendarFilter === 'all' || calendarFilter === 'events';
    const includePolls = calendarFilter === 'all' || calendarFilter === 'polls';
    
    const eventCalendarItems = includeEvents ? filteredEvents.map((e) => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      const isMultiDay = this.isMultiDayItem(start, end);
      
      // Add (ALL DAY) prefix for multi-day events - helps identify them in day/week views
      const title = isMultiDay ? `<strong>(ALL DAY)</strong> ${e.title}` : e.title;
      
      return {
        title,
        start,
        end,
        allDay: isMultiDay,
        color: this.getColorForCalendar(e.calendar_id),
        meta: {
          type: 'event',
          id: e.event_id,
          calendarId: e.calendar_id,
          description: e.description ?? '',
          notes: e.notes ?? '',
          tags: e.tags ?? [],
        },
      };
    }) : [];
    
    // Transform polls to calendar events with POLL prefix
    const pollCalendarItems = includePolls ? filteredPolls.map((p) => {
      const start = new Date(p.start_time);
      const end = new Date(p.end_time);
      const isMultiDay = this.isMultiDayItem(start, end);
      
      // Add (ALL DAY) prefix for multi-day polls
      const title = isMultiDay 
        ? `<strong>(ALL DAY) POLL:</strong> ${p.title}` 
        : `<strong>POLL:</strong> ${p.title}`;
      
      return {
        title,
        start,
        end,
        allDay: isMultiDay,
        color: this.getColorForCalendar(p.calendar_id),
        meta: {
          type: 'poll',
          id: p.poll_id,
          calendarId: p.calendar_id,
          description: p.description ?? '',
          notes: p.notes ?? '',
          tags: p.tags ?? [],
        },
      };
    }) : [];
    
    // Merge and return all calendar items
    return [...eventCalendarItems, ...pollCalendarItems];
  });

  /**
   * Check if an item spans multiple days
   * Returns true if start and end dates are on different calendar days
   */
  private isMultiDayItem(start: Date, end: Date): boolean {
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return endDay.getTime() > startDay.getTime();
  }

  private getColorForCalendar(calendarId: string): { primary: string; secondary: string } {
    return getCalendarColor(calendarId);
  }

  onEventClicked(event: CalendarEvent): void {
    const itemId = event.meta?.id;
    const itemType = event.meta?.type;
    
    if (!itemId || !itemType) return;
    
    if (itemType === 'event') {
      console.log('[CalendarDisplay] Event clicked:', itemId);
      this.eventClicked.emit(itemId);
    } else if (itemType === 'poll') {
      console.log('[CalendarDisplay] Poll clicked:', itemId);
      this.pollClicked.emit(itemId);
    }
  }

  onViewDateChange(newDate: Date): void {
    this.viewDate = newDate;
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, newDate.toISOString());
  }

  onOpenEventSelector(): void {
    this.openEventSelector.emit();
  }

  setCalendarFilter(filter: CalendarFilter): void {
    this.calendarFilter.set(filter);
  }
}