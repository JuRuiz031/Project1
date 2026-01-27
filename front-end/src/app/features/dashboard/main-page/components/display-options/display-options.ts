import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './display-options.html',
  styleUrl: './display-options.css',
})
export class DisplayOptions implements OnChanges, OnDestroy {
  /** receive data from MainPage */
  @Input() calendars: CalendarOptionDTO[] = [];
  @Input() tags: string[] = [];

  /** emit selected calendar_ids back to MainPage */
  @Output() selectedCalendarIdsChange = new EventEmitter<string[]>();

  /** Reactive form to manage checkbox state */
  checkboxForm = new FormGroup({});

  /** Cleanup subscriptions */
  private destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['calendars']) return;

    // Rebuild form when calendars change
    this.checkboxForm = new FormGroup({});

    if (!this.calendars?.length) {
      this.emitSelection();
      return;
    }

    // Create a FormControl for each calendar (all checked by default)
    this.calendars.forEach((c) => {
      this.checkboxForm.addControl(c.calendar_id, new FormControl(true));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private emitSelection(): void {
    const selectedIds = Object.entries(this.checkboxForm.value)
      .filter(([_, isSelected]) => isSelected === true)
      .map(([id]) => id);

    this.selectedCalendarIdsChange.emit(selectedIds);
  }
}
