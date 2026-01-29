import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPollModal } from './view-poll-modal';

describe('ViewPoll', () => {
  let component: ViewPollModal;
  let fixture: ComponentFixture<ViewPollModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPollModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPollModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
