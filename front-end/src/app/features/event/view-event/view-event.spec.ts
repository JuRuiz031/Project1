import { TestBed } from '@angular/core/testing';
import { ViewEvent } from './view-event';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EventDTO } from '../../../shared/models/events/event.dto';
import { CalendarApiService } from '../../../shared/services/api/calendar-api.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

describe('ViewEvent', () => {
  const mockEvent: EventDTO = {
    event_id: 'e1',
    calendar_id: '2',
    title: 'Team Meeting',
    start_time: '2026-01-26T10:15:00',
    end_time: '2026-01-26T11:00:00',
    description: 'Discuss roadmap',
    notes: 'Bring notes',
    tags: ['work'],
  };

  const activatedRouteStub = {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'eventId' ? 'e1' : null),
      },
    },
  };

  const calendarApiStub = {
    getByEventIds: (_ids: Array<string | number>) =>
      of<CalendarFilterResponseDTO>({ events: [mockEvent] }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEvent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: CalendarApiService, useValue: calendarApiStub },
      ],
    }).compileComponents();
  });

  it('ngOnInit should fetch the event via CalendarApiService and populate the form', () => {
    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.apiError).toBe('');
    expect(component.form.disabled).toBe(true);

    expect(component.form.get('calendarId')?.value).toBe('2');
    expect(component.form.get('title')?.value).toBe('Team Meeting');

    expect(component.form.get('startDate')?.value).toBe('2026-01-26');
    expect(component.form.get('startTime')?.value).toBe('10:15');

    expect(component.form.get('endDate')?.value).toBe('2026-01-26');
    expect(component.form.get('endTime')?.value).toBe('11:00');

    expect(component.form.get('description')?.value).toBe('Discuss roadmap');
    expect(component.form.get('notes')?.value).toBe('Bring notes');
  });

  it('ngOnInit should set apiError to "Event not found" when events array is empty', async () => {
    TestBed.overrideProvider(CalendarApiService, {
      useValue: { getByEventIds: () => of<CalendarFilterResponseDTO>({ events: [] }) },
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError).toBe('Event not found');
  });

  it('ngOnInit should set apiError when the API call fails', async () => {
    TestBed.overrideProvider(CalendarApiService, {
      useValue: { getByEventIds: () => throwError(() => new Error('boom')) },
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError).toBe('Could not load event');
  });

  it('displayEvent should populate the form from an EventDTO and keep the form disabled', () => {
    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    component.displayEvent(mockEvent);

    expect(component.form.disabled).toBe(true);
    expect(component.form.get('calendarId')?.value).toBe('2');
    expect(component.form.get('title')?.value).toBe('Team Meeting');
    expect(component.form.get('startDate')?.value).toBe('2026-01-26');
    expect(component.form.get('startTime')?.value).toBe('10:15');
    expect(component.form.get('endDate')?.value).toBe('2026-01-26');
    expect(component.form.get('endTime')?.value).toBe('11:00');
  });

  it('displayEvent should handle missing optional fields by defaulting to empty strings', () => {
    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    const event: EventDTO = {
      event_id: 'e2',
      calendar_id: '1',
      title: 'No Optional Fields',
      start_time: '2026-01-26T09:00:00Z',
      end_time: '2026-01-26T09:30:00Z',
      tags: [],
    };

    component.displayEvent(event);

    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('notes')?.value).toBe('');
  });

  it('displayEvent should set blank date/time if ISO string is invalid', () => {
    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    const event: EventDTO = {
      event_id: 'e3',
      calendar_id: '1',
      title: 'Bad Date',
      start_time: 'not-a-date',
      end_time: '',
      tags: [],
    };

    component.displayEvent(event);

    expect(component.form.get('startDate')?.value).toBe('');
    expect(component.form.get('startTime')?.value).toBe('');
    expect(component.form.get('endDate')?.value).toBe('');
    expect(component.form.get('endTime')?.value).toBe('');
  });
});
