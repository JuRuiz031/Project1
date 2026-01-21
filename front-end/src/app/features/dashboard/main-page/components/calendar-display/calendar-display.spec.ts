import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDisplay } from './calendar-display';

describe('CalendarDisplay', () => {
  let component: CalendarDisplay;
  let fixture: ComponentFixture<CalendarDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDisplay],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
