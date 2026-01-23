import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCalendarGroup } from './view-calendar-group';

describe('ViewCalendarGroup', () => {
  let component: ViewCalendarGroup;
  let fixture: ComponentFixture<ViewCalendarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCalendarGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCalendarGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
