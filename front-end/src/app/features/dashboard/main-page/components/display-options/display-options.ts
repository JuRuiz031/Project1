import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

export type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-options.html',
  styleUrl: './display-options.css',
})
export class DisplayOptions implements OnChanges {
  /** receive data from MainPage */
  @Input() calendars: CalendarOptionDTO[] = [];
  @Input() tags: string[] = [];

  /** emit selected calendar_ids back to MainPage */
  @Output() selectedCalendarIdsChange = new EventEmitter<string[]>();

  /** local UI state */
  private selectedIds = new Set<string>();

  /**
   * Optional default behavior:
   * - when calendars arrive the first time, select all
   * - if the list changes later, auto-add any new calendars (keep user's existing selections)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['calendars']) return;

    if (!this.calendars?.length) {
      this.selectedIds.clear();
      this.emitSelection();
      return;
    }

    // If nothing selected yet, default to "all selected"
    if (this.selectedIds.size === 0) {
      this.calendars.forEach((c) => this.selectedIds.add(c.calendar_id));
      this.emitSelection();
      return;
    }

    // Keep selection in sync with incoming calendars:
    // - remove ids that no longer exist
    // - add ids for newly introduced calendars only if you want that behavior
    const validIds = new Set(this.calendars.map((c) => c.calendar_id));

    // remove no-longer-valid selections
    for (const id of Array.from(this.selectedIds)) {
      if (!validIds.has(id)) this.selectedIds.delete(id);
    }

    // OPTIONAL: auto-select newly added calendars
    // (comment this loop out if you *don't* want that)
    for (const id of Array.from(validIds)) {
      if (!this.selectedIds.has(id)) this.selectedIds.add(id);
    }

    this.emitSelection();
  }

  isChecked(calendarId: string): boolean {
    return this.selectedIds.has(calendarId);
  }

  onToggle(calendarId: string, checked: boolean): void {
    if (checked) this.selectedIds.add(calendarId);
    else this.selectedIds.delete(calendarId);

    this.emitSelection();
  }

  private emitSelection(): void {
    this.selectedCalendarIdsChange.emit(Array.from(this.selectedIds));
  }
}
