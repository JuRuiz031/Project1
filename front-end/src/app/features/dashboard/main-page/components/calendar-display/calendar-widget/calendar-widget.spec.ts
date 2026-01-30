import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWidget } from './calendar-widget';

// ✅ angular-calendar needs these providers
import { CalendarA11y, CalendarUtils, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

describe('CalendarWidget', () => {
  let component: CalendarWidget;
  let fixture: ComponentFixture<CalendarWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarWidget],
      providers: [
        { provide: DateAdapter, useFactory: adapterFactory },
        CalendarUtils,
        CalendarA11y,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});