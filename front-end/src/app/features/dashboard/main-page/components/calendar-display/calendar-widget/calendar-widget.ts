import {
  Component,
  input,
  output,
  signal,
  effect,
  ChangeDetectionStrategy,
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
  CalendarDateFormatter,
  CalendarNativeDateFormatter,
} from 'angular-calendar';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,

  // ✅ Fix: CalendarDatePipe requires a formatter provider.
  // Providing it here keeps tests + nested consumers from needing to wire it up.
  providers: [{ provide: CalendarDateFormatter, useClass: CalendarNativeDateFormatter }],

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
export class CalendarWidget implements AfterViewInit {
  // Signal inputs from parent
  initialViewDate = input<Date>(new Date(), { alias: 'viewDate' });
  events = input<CalendarEvent[]>([]);

  // Outputs to parent
  viewDateChange = output<Date>();
  eventClicked = output<CalendarEvent>();

  // Local mutable state for the calendar library's two-way binding
  currentViewDate = signal<Date>(new Date());

  constructor() {
    // Sync input changes to local state
    effect(() => {
      this.currentViewDate.set(this.initialViewDate());
    });

    // Trigger refresh when events change
    effect(() => {
      this.events(); // read to track
      this.refresh.next();
    });
  }

  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;

  refresh = new Subject<void>();
  activeDayIsOpen = false;

  @ViewChild('timeViewScroll') timeViewScroll?: ElementRef<HTMLElement>;

  readonly scrollStartHour = 8;
  readonly hourSegments = 2;
  readonly hourSegmentHeight = 30;

  readonly dayStartHour = 0;
  readonly dayEndHour = 23;

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
    this.scrollToStartHour();
  }

  onViewDateChange(date: Date) {
    this.currentViewDate.set(date);
    this.viewDateChange.emit(date);
    this.activeDayIsOpen = false;
    this.scrollToStartHour();
  }

  handleEventClicked(event: CalendarEvent) {
    this.eventClicked.emit(event);
  }

  dayClicked({ date }: { date: Date; events: CalendarEvent[] }): void {
    if (this.view === CalendarView.Month) {
      this.currentViewDate.set(date);
      this.viewDateChange.emit(date);
      this.view = CalendarView.Day;
      this.activeDayIsOpen = false;
      this.scrollToStartHour();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToStartHour();
  }

  private scrollToStartHour(): void {
    if (this.view !== CalendarView.Week && this.view !== CalendarView.Day) return;

    setTimeout(() => {
      const el = this.timeViewScroll?.nativeElement;
      if (!el) return;

      const hourHeightPx = this.hourSegments * this.hourSegmentHeight;
      el.scrollTop = this.scrollStartHour * hourHeightPx;
    }, 0);
  }
}