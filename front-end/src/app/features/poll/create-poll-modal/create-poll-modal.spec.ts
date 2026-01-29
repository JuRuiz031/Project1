import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePollModal } from './create-poll-modal';

describe('CreatePoll', () => {
  let component: CreatePollModal;
  let fixture: ComponentFixture<CreatePollModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePollModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePollModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
