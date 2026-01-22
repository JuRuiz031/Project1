import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEvent } from './delete-event';

describe('DeleteEvent', () => {
  let component: DeleteEvent;
  let fixture: ComponentFixture<DeleteEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEvent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
