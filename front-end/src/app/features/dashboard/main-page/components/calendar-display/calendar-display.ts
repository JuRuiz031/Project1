import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  // Placeholder state only — real calendar logic comes later
  currentViewLabel = 'Month';
}
