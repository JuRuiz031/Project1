import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page';

import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  CalendarA11y,
  CalendarUtils,
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
        // ✅ Fix: RouterLink requires router DI (ActivatedRoute, etc.)
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            paramMap: of(convertToParamMap({})),
            queryParamMap: of(convertToParamMap({})),
            params: of({}),
            queryParams: of({}),
            data: of({}),
          },
        },

        // ✅ Keep these for angular-calendar views
        { provide: DateAdapter, useFactory: adapterFactory },
        { provide: CalendarDateFormatter, useClass: CalendarNativeDateFormatter },
        CalendarUtils,
        CalendarA11y,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;

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