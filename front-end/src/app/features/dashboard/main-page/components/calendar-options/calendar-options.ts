import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-options.html',
  styleUrl: './calendar-options.css',
})
export class CalendarOptions {
  viewCalendars = output<void>();

  onViewCalendars(): void {
    console.log('[CalendarOptions] View Calendars clicked');
    this.viewCalendars.emit();
  }
}