import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarOptions } from './calendar-options';

describe('CalendarOptions', () => {
  let component: CalendarOptions;
  let fixture: ComponentFixture<CalendarOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
