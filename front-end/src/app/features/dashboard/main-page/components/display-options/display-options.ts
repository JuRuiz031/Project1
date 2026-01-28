import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnDestroy,
  inject,
} from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CALENDAR_COLOR_PALETTE } from '../calendar-display/calendar-colors';

export type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './display-options.html',
  styleUrl: './display-options.css',
})
export class DisplayOptions implements OnDestroy {
  /** receive data from MainPage */
  calendars = input<CalendarOptionDTO[]>([]);
  tags = input<string[]>([]);

  /** emit selected calendar_ids back to MainPage */
  selectedCalendarIdsChange = output<string[]>();

  /** Reactive form to manage checkbox state */
  checkboxForm = new FormGroup({});

  /** Map of calendar_id to color for displaying colored dots */
  colorMap = new Map<string, { primary: string; secondary: string }>();

  /** Cleanup subscriptions */
  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.rebuildForm(this.calendars());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rebuildForm(calendars: CalendarOptionDTO[]): void {
    this.checkboxForm = new FormGroup({});
    this.colorMap.clear();

    if (!calendars?.length) {
      this.emitSelection();
      return;
    }

    // Create a FormControl for each calendar (all checked by default)
    calendars.forEach((c, index) => {
      this.checkboxForm.addControl(c.calendar_id, new FormControl(true));
      // Assign color based on index in palette
      this.colorMap.set(c.calendar_id, CALENDAR_COLOR_PALETTE[index % CALENDAR_COLOR_PALETTE.length]);
    });

    // Subscribe to value changes for instant updates
    this.checkboxForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitSelection();
      });

    // Emit initial selection (all selected)
    this.emitSelection();
  }

  private emitSelection(): void {
    const selectedIds = Object.entries(this.checkboxForm.value)
      .filter(([_, isSelected]) => isSelected === true)
      .map(([id]) => id);

    this.selectedCalendarIdsChange.emit(selectedIds);
  }

  getCalendarColor(calendarId: string): string {
    return this.colorMap.get(calendarId)?.primary || '#cccccc';
  }
}
