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
export class CalendarWidget implements OnChanges, AfterViewInit {
  @Input() viewDate: Date = new Date();
  @Output() viewDateChange = new EventEmitter<Date>();

  @Input() events: CalendarEvent[] = [];
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

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
    this.viewDate = date;
    this.viewDateChange.emit(date);
    this.activeDayIsOpen = false;
    this.scrollToStartHour();
  }

  handleEventClicked(event: CalendarEvent) {
    this.eventClicked.emit(event);
  }

  dayClicked({ date }: { date: Date; events: CalendarEvent[] }): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = date;
      this.viewDateChange.emit(date);
      this.view = CalendarView.Day;
      this.activeDayIsOpen = false;
      this.scrollToStartHour();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) this.refresh.next();
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