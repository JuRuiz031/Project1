import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';

import { CalendarWidget } from './calendar-widget/calendar-widget';
import { CALENDAR_COLOR_PALETTE } from './calendar-colors';

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
  openEventSelector = output<void>();
  eventClicked = output<string>();  // Emit event ID when user clicks on event
  createEvent = output<void>();  // Emit when user wants to create event

  private calendarColorMap = new Map<string, { primary: string; secondary: string }>();
  private readonly STORAGE_KEY = 'calendar_view_date';

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
    return this.events().map((e) => ({
      title: e.title,
      start: new Date(e.start_time),
      end: new Date(e.end_time),
      allDay: false,
      color: this.getColorForCalendar(e.calendar_id),
      meta: {
        id: e.event_id,
        calendarId: e.calendar_id,
        description: e.description ?? '',
        notes: e.notes ?? '',
        tags: e.tags ?? [],
      },
    }));
  });

  private getColorForCalendar(calendarId: string): { primary: string; secondary: string } {
    if (!this.calendarColorMap.has(calendarId)) {
      const index = this.calendarColorMap.size % CALENDAR_COLOR_PALETTE.length;
      this.calendarColorMap.set(calendarId, CALENDAR_COLOR_PALETTE[index]);
    }
    return this.calendarColorMap.get(calendarId)!;
  }

  onEventClicked(event: CalendarEvent): void {
    const eventId = event.meta?.id;
    if (eventId) {
      console.log('[CalendarDisplay] Event clicked:', eventId);
      this.eventClicked.emit(eventId);
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
}