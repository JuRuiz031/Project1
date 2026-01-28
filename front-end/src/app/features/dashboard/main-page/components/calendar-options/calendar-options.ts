import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-calendar-options',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar-options.html',
  styleUrl: './calendar-options.css',
})
export class CalendarOptions {
  createCalendar = output<void>();

  onCreateCalendar(): void {
    this.createCalendar.emit();
  }
}
