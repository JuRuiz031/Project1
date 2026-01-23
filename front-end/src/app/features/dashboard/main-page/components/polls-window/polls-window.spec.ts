import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollsWindow } from './polls-window';

describe('PollsWindow', () => {
  let component: PollsWindow;
  let fixture: ComponentFixture<PollsWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollsWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(PollsWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
