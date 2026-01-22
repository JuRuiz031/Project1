import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCalendarGroup } from './edit-calendar-group';

describe('EditCalendarGroup', () => {
  let component: EditCalendarGroup;
  let fixture: ComponentFixture<EditCalendarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCalendarGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCalendarGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
