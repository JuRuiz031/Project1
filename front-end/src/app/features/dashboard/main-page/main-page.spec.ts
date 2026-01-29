import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page';

import {
  DateAdapter,
  CalendarDateFormatter,
  CalendarNativeDateFormatter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageComponent],
      providers: [
        // angular-calendar DateAdapter (fixes NG0201: DateAdapter)
        { provide: DateAdapter, useFactory: adapterFactory },

        // angular-calendar date formatter (fixes NG0201: _CalendarDateFormatter)
        { provide: CalendarDateFormatter, useClass: CalendarNativeDateFormatter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;

    // MainPage reads localStorage in ngOnInit; give it something valid.
    localStorage.setItem('user', JSON.stringify({ user_id: 'test-user' }));

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});