import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  // Placeholder state only — real calendar logic comes later
  currentViewLabel = 'Month';
}
