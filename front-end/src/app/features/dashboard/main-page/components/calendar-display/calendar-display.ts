import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
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
  imports: [CommonModule, RouterLink, CalendarWidget],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  viewDate = new Date();

  events = input<EventDTO[]>([]);

  private calendarColorMap = new Map<string, { primary: string; secondary: string }>();

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

  onEventClicked(event: CalendarEvent) {
    console.log('Clicked event:', event.meta?.id, event);
  }
}