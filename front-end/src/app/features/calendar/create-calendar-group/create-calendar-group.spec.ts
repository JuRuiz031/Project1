import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCalendarGroup } from './create-calendar-group';

describe('CreateCalendarGroup', () => {
  let component: CreateCalendarGroup;
  let fixture: ComponentFixture<CreateCalendarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCalendarGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCalendarGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
