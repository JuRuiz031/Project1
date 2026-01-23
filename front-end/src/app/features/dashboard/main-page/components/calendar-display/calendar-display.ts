import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarModule, CalendarEvent } from 'angular-calendar';
import { CalendarWidget } from './calendar-widget/calendar-widget';

// TEST MOCK DATA IMPORT
import { MOCK_CALENDAR_EVENTS_RESPONSE } 
  from '../../../../../mock-data/calendar-events.mock';

// (optional) define the API shape so TS helps you
type ApiEvent = {
  id: number;
  calendar_id: number;
  title: string;
  start_time: string;
  end_time?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  all_day?: boolean;
};
  
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
    const apiEvents = MOCK_CALENDAR_EVENTS_RESPONSE.events as ApiEvent[];

    this.events = apiEvents.map((e) => ({
      title: e.title,
      start: new Date(e.start_time),
      end: e.end_time ? new Date(e.end_time) : undefined,
      allDay: e.all_day ?? false,
      meta: {
        id: e.id,
        calendarId: e.calendar_id,
        description: e.description ?? '',
        notes: e.notes ?? '',
        tags: e.tags ?? [],
      },
    }));
  }

  onEventClicked(event: CalendarEvent) {
    console.log('Clicked event:', event.meta?.id, event);
  }
}