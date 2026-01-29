import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';

import { PollsWindow } from './polls-window';

describe('PollsWindow', () => {
  let component: PollsWindow;
  let fixture: ComponentFixture<PollsWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollsWindow],
      providers: [
        provideRouter([]),      // provides Router + ActivatedRoute tree
        provideLocationMocks(), // prevents real browser location wiring in tests
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PollsWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});