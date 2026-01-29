import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoll } from './view-poll-modal';

describe('ViewPoll', () => {
  let component: ViewPoll;
  let fixture: ComponentFixture<ViewPoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPoll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPoll);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
