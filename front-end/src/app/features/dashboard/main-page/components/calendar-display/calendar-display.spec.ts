import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDisplay } from './calendar-display';

import { CalendarA11y, CalendarUtils, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

describe('CalendarDisplay', () => {
  let component: CalendarDisplay;
  let fixture: ComponentFixture<CalendarDisplay>;

  beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [CalendarDisplay],
    providers: [
      { provide: DateAdapter, useFactory: adapterFactory },
      CalendarUtils,
      CalendarA11y,
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CalendarDisplay);
  component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});