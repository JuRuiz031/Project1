import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSelectorModal } from './calendar-selector-modal';

describe('CalendarSelectorModal', () => {
  let component: CalendarSelectorModal;
  let fixture: ComponentFixture<CalendarSelectorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarSelectorModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarSelectorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
