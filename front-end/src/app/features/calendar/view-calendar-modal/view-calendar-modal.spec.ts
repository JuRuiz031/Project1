import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ViewCalendarModal } from './view-calendar-modal';
import { CalendarService } from '../../../shared/services/calendar.service';

describe('ViewCalendarModal', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [ViewCalendarModal],
      providers: [
        {
          provide: CalendarService,
          useValue: {
            getHomepage: vi.fn(() => of({ calendars: [] })),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ViewCalendarModal);
    expect(fixture.componentInstance).toBeTruthy();
  });
});