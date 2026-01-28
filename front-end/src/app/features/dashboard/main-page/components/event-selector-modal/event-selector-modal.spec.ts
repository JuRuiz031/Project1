import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSelectorModal } from './event-selector-modal';

describe('EventSelectorModal', () => {
  let component: EventSelectorModal;
  let fixture: ComponentFixture<EventSelectorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSelectorModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSelectorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
