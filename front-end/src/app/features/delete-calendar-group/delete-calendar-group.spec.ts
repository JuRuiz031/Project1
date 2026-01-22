import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCalendarGroup } from './delete-calendar-group';

describe('DeleteCalendarGroup', () => {
  let component: DeleteCalendarGroup;
  let fixture: ComponentFixture<DeleteCalendarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCalendarGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCalendarGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
