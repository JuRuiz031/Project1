import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarModule, CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [RouterLink, CalendarModule],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  // Placeholder state only — real calendar logic comes later
  currentViewLabel = 'Month';

  viewDate = new Date();
  events: CalendarEvent[] = [];
}
