import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCalendarModal } from './delete-calendar-modal';

describe('DeleteCalendarModal', () => {
  let component: DeleteCalendarModal;
  let fixture: ComponentFixture<DeleteCalendarModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCalendarModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCalendarModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
