import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { CalendarWidget } from './calendar-widget/calendar-widget';
  
@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [RouterLink, CalendarWidget],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  viewDate = new Date();

  // This is what the widget consumes
  events: CalendarEvent[] = [];

  constructor() {
    const apiEvents: any[] = [];

    this.events = apiEvents.map((e) => ({
      title: e.title,
      start: new Date(e.start_time),
      end: new Date(e.end_time),           // always present now
      allDay: false,                       // UI-only concern, not in API
      meta: {
        id: e.event_id,
        calendarId: e.calendar_id,
        description: e.description ?? '',
        notes: e.notes ?? '',
        tags: e.tags,                      // guaranteed by DTO
      },
    }));
  }

  onEventClicked(event: CalendarEvent) {
    console.log('Clicked event:', event.meta?.id, event);
  }
}