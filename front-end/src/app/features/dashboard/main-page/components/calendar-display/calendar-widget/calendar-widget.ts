import { Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarView,
  CalendarMonthViewComponent,
  CalendarWeekViewComponent,
  CalendarDayViewComponent,
  CalendarPreviousViewDirective,
  CalendarNextViewDirective,
  CalendarTodayDirective,
  CalendarDatePipe,
} from 'angular-calendar';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CalendarPreviousViewDirective,
    CalendarNextViewDirective,
    CalendarTodayDirective,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarDatePipe,
  ],
  templateUrl: './calendar-widget.html',
})
export class CalendarWidget {
  @Input() viewDate: Date = new Date();
  @Output() viewDateChange = new EventEmitter<Date>();

  @Input() events: CalendarEvent[] = [];
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;

  refresh = new Subject<void>();
  activeDayIsOpen = false;

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
  }

  // keep your page in sync when directives change the date
  onViewDateChange(date: Date) {
    this.viewDate = date;
    this.viewDateChange.emit(date);
    this.activeDayIsOpen = false;
  }

  handleEventClicked(event: CalendarEvent) {
    this.eventClicked.emit(event);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.refresh.next();
    }
  }
}
