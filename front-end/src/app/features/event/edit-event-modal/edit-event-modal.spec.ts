import { TestBed } from '@angular/core/testing';
import { EditEventModal } from './edit-event-modal';
import { of, throwError } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { EventService } from '../../../shared/services/event.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

describe('EditEventModal', () => {
  // Use Z timestamps so isoToDateTime() converts to local time reliably.
  // 16:15Z == 10:15 in America/Chicago (CST) for Jan 26.
  const mockEvent: EventDTO = {
    event_id: 'e1',
    calendar_id: '2',
    title: 'Loaded Event',
    start_time: '2026-01-26T16:15:00Z',
    end_time: '2026-01-26T17:00:00Z',
    description: 'Loaded desc',
    notes: 'Loaded notes',
    tags: ['work'],
  };

  let calendarServiceStub: {
    getByEventIds: jasmine.Spy;
    getHomepage: jasmine.Spy;
  };

  let eventServiceStub: {
    update: jasmine.Spy;
  };

  beforeEach(async () => {
    calendarServiceStub = {
      getByEventIds: jasmine.createSpy('getByEventIds').and.returnValue(
        of<CalendarFilterResponseDTO>({ events: [mockEvent] })
      ),
      // ngOnInit() calls loadCalendars() which calls getHomepage(); not fatal, but must exist
      getHomepage: jasmine.createSpy('getHomepage').and.returnValue(
        of({ calendars: [] })
      ),
    };

    eventServiceStub = {
      update: jasmine.createSpy('update').and.returnValue(of(mockEvent)),
    };

    await TestBed.configureTestingModule({
      imports: [EditEventModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceStub },
        { provide: EventService, useValue: eventServiceStub },
      ],
    }).compileComponents();
  });

  it('ngOnInit should load the event via CalendarService and populate the form', () => {
    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', 'e1');
    fixture.detectChanges(); // triggers ngOnInit

    expect(component.apiError()).toBe('');

    expect(component.form.get('calendarId')?.value).toBe('2');
    expect(component.form.get('title')?.value).toBe('Loaded Event');

    expect(component.form.get('startDate')?.value).toBe('2026-01-26');
    expect(component.form.get('startTime')?.value).toBe('10:15');

    expect(component.form.get('endDate')?.value).toBe('2026-01-26');
    expect(component.form.get('endTime')?.value).toBe('11:00');

    expect(component.form.get('description')?.value).toBe('Loaded desc');
    expect(component.form.get('notes')?.value).toBe('Loaded notes');

    expect(calendarServiceStub.getByEventIds).toHaveBeenCalledOnceWith(['e1']);
  });

  it('ngOnInit should set apiError to "Event not found" when no event is returned', () => {
    calendarServiceStub.getByEventIds.and.returnValue(
      of<CalendarFilterResponseDTO>({ events: [] })
    );

    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', 'e1');
    fixture.detectChanges();

    expect(component.apiError()).toBe('Event not found');
  });

  it('ngOnInit should set apiError when loading fails', () => {
    calendarServiceStub.getByEventIds.and.returnValue(
      throwError(() => new Error('boom'))
    );

    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', 'e1');
    fixture.detectChanges();

    expect(component.apiError()).toBe('boom');
  });

  it('saveChanges should call EventService.update and emit eventUpdated on success', () => {
    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', 'e1');
    fixture.detectChanges(); // loads event and sets internal eventIdValue

    const eventUpdatedSpy = jasmine.createSpy('eventUpdatedSpy');
    const closeSpy = jasmine.createSpy('closeSpy');
    component.eventUpdated.subscribe(eventUpdatedSpy);
    component.close.subscribe(closeSpy);

    component.form.patchValue({
      calendarId: '2',
      title: 'Updated Title',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '13:00',
      description: 'Updated desc',
      notes: 'Updated notes',
    });

    component.saveChanges();

    expect(eventServiceStub.update).toHaveBeenCalledTimes(1);

    const [eventId, dto] = eventServiceStub.update.calls.mostRecent().args as [
      string,
      {
        calendar_id: string;
        title: string;
        start_time: string;
        end_time: string;
        description?: string;
        notes?: string;
        tags?: string[];
      }
    ];

    expect(eventId).toBe('e1');
    expect(dto.calendar_id).toBe('2');
    expect(dto.title).toBe('Updated Title');

    // Timestamps are now local datetime strings (YYYY-MM-DDTHH:mm:ss format), not UTC ISO
    const expectedStartLocal = '2026-01-26T12:00:00';
    const expectedEndLocal = '2026-01-26T13:00:00';

    expect(dto.start_time).toBe(expectedStartLocal);
    expect(dto.end_time).toBe(expectedEndLocal);

    expect(eventUpdatedSpy).toHaveBeenCalledOnceWith('e1');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('saveChanges should set apiError and NOT call update when end <= start', () => {
    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', 'e1');
    fixture.detectChanges();

    component.form.patchValue({
      calendarId: '2',
      title: 'Updated Title',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '12:00',
      description: 'Updated desc',
      notes: 'Updated notes',
    });

    component.saveChanges();

    expect(eventServiceStub.update).not.toHaveBeenCalled();
    expect(component.apiError()).toBe('End must be after start.');
  });
});