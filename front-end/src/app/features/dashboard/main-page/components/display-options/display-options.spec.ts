import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayOptions } from './display-options';

describe('DisplayOptions', () => {
  let component: DisplayOptions;
  let fixture: ComponentFixture<DisplayOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
