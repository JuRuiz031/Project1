import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoll } from './view-poll';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
