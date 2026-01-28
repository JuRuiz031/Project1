import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calendar-options',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar-options.html',
  styleUrl: './calendar-options.css',
})
export class CalendarOptions {
  createCalendar = output<void>();
  viewCalendars = output<void>();

  onCreateCalendar(): void {
    this.createCalendar.emit();
  }

  onViewCalendars(): void {
    this.viewCalendars.emit();
  }
}