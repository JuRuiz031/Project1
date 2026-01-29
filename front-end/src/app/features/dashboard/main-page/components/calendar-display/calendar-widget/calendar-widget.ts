import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
export class CalendarWidget implements OnChanges, AfterViewInit {
  @Input() viewDate: Date = new Date();
  @Output() viewDateChange = new EventEmitter<Date>();

  @Input() events: CalendarEvent[] = [];
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;

  refresh = new Subject<void>();
  activeDayIsOpen = false;

  // ---- scroll + time-grid config (week/day) ----
  @ViewChild('timeViewScroll') timeViewScroll?: ElementRef<HTMLElement>;

  /** where the scroll window should start */
  readonly scrollStartHour = 8;

  /** keep these aligned with the view inputs below */
  readonly hourSegments = 2;
  readonly hourSegmentHeight = 30;

  /** keep full day available (midnight -> 11:59pm), but start scrolled at 8am */
  readonly dayStartHour = 0;
  readonly dayEndHour = 23;

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
    this.scrollToStartHour();
  }

  // keep your page in sync when directives change the date
  onViewDateChange(date: Date) {
    this.viewDate = date;
    this.viewDateChange.emit(date);
    this.activeDayIsOpen = false;
    this.scrollToStartHour();
  }

  handleEventClicked(event: CalendarEvent) {
    this.eventClicked.emit(event);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = date;
      this.viewDateChange.emit(date);
      this.view = CalendarView.Day;
      this.activeDayIsOpen = false;
      this.scrollToStartHour();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.refresh.next();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToStartHour();
  }

  private scrollToStartHour(): void {
    if (this.view !== CalendarView.Week && this.view !== CalendarView.Day) return;

    // the week/day view DOM is created by @switch, so wait a tick
    setTimeout(() => {
      const el = this.timeViewScroll?.nativeElement;
      if (!el) return;

      const hourHeightPx = this.hourSegments * this.hourSegmentHeight; // default = 2 * 30 = 60px per hour
      el.scrollTop = this.scrollStartHour * hourHeightPx; // 8am
    }, 0);
  }
}
