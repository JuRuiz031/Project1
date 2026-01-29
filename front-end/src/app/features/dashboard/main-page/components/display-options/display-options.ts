import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { getCalendarColor } from '../../../../../config/calendar-colors';

export type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-options.html',
  styleUrl: './display-options.css',
})
export class DisplayOptions implements OnDestroy {
  /** receive data from MainPage */
  calendars = input<CalendarOptionDTO[]>([]);
  tags = input<string[]>([]);

  /** emit selected calendar_ids and tags back to MainPage */
  selectedCalendarIdsChange = output<string[]>();
  selectedTagsChange = output<string[]>();

  /** State for selected calendars and tags */
  selectedCalendarIds = signal<string[]>([]);
  selectedTags = signal<string[]>([]);

  /** Cleanup subscriptions */
  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const cals = this.calendars();

      // Select all calendars by default on first load
      if (cals.length > 0 && this.selectedCalendarIds().length === 0) {
        const allIds = cals.map(c => c.calendar_id);
        this.selectedCalendarIds.set(allIds);
        this.selectedCalendarIdsChange.emit(allIds);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleCalendar(calendarId: string): void {
    this.selectedCalendarIds.update(current => {
      if (current.includes(calendarId)) {
        return current.filter(id => id !== calendarId);
      } else {
        return [...current, calendarId];
      }
    });
    this.selectedCalendarIdsChange.emit(this.selectedCalendarIds());
  }

  isCalendarSelected(calendarId: string): boolean {
    return this.selectedCalendarIds().includes(calendarId);
  }

  clearCalendarFilters(): void {
    this.selectedCalendarIds.set([]);
    this.selectedCalendarIdsChange.emit([]);
  }

  toggleTag(tag: string): void {
    this.selectedTags.update(current => {
      if (current.includes(tag)) {
        return current.filter(t => t !== tag);
      } else {
        return [...current, tag];
      }
    });
    this.selectedTagsChange.emit(this.selectedTags());
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  clearTagFilters(): void {
    this.selectedTags.set([]);
    this.selectedTagsChange.emit([]);
  }

  getCalendarColor(calendarId: string): { primary: string; secondary: string } {
    return getCalendarColor(calendarId);
  }
}
