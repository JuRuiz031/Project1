import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCalendar } from './create-calendar';

describe('CreateCalendar', () => {
  let component: CreateCalendar;
  let fixture: ComponentFixture<CreateCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
