import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCalendarModal } from './edit-calendar-modal';

describe('EditCalendarModal', () => {
  let component: EditCalendarModal;
  let fixture: ComponentFixture<EditCalendarModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCalendarModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCalendarModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
