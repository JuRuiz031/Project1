import { TestBed } from '@angular/core/testing';
import { EditEventModal } from './edit-event-modal';
import { of, throwError } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { EventService } from '../../../shared/services/event.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

describe('EditEventModal', () => {
  const mockEvent: EventDTO = {
    event_id: 'e1',
    calendar_id: '2',
    title: 'Loaded Event',
    start_time: '2026-01-26T10:15:00',
    end_time: '2026-01-26T11:00:00',
    description: 'Loaded desc',
    notes: 'Loaded notes',
    tags: ['work'],
  };

  const calendarServiceStub = {
    getByEventIds: (_ids: string[]) =>
      of<CalendarFilterResponseDTO>({ events: [mockEvent] }),
  };

  // const eventServiceStub = {
  //   update: (_eventId: string, _dto: any) => of(mockEvent),
  // };
  let eventServiceStub: { update: any };


  beforeEach(async () => {
    eventServiceStub = {
      update: vi.fn(() => of(mockEvent)),
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

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.apiError).toBe('');

    expect(component.form.get('calendarId')?.value).toBe('2');
    expect(component.form.get('title')?.value).toBe('Loaded Event');

    expect(component.form.get('startDate')?.value).toBe('2026-01-26');
    expect(component.form.get('startTime')?.value).toBe('10:15');

    expect(component.form.get('endDate')?.value).toBe('2026-01-26');
    expect(component.form.get('endTime')?.value).toBe('11:00');

    expect(component.form.get('description')?.value).toBe('Loaded desc');
    expect(component.form.get('notes')?.value).toBe('Loaded notes');
  });

  it('ngOnInit should set apiError to "Event not found" when no event is returned', async () => {
    TestBed.overrideProvider(CalendarService, {
      useValue: { getByEventIds: () => of<CalendarFilterResponseDTO>({ events: [] }) },
    });

    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError).toBe('Event not found');
  });

  it('ngOnInit should set apiError when loading fails', async () => {
    TestBed.overrideProvider(CalendarService, {
      useValue: { getByEventIds: () => throwError(() => new Error('boom')) },
    });

    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError).toBe('Could not load event');
  });

  it('saveChanges should call EventService.update and emit eventUpdated on success', () => {
    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;
    const eventService = TestBed.inject(EventService) as any;

    fixture.detectChanges(); // ensures eventId is set from route & form populated

    const updateSpy = vi.spyOn(eventService, 'update').mockReturnValue(of(mockEvent));
    const eventUpdatedSpy = vi.fn();
    const closeSpy = vi.fn();
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

    expect(updateSpy).toHaveBeenCalledTimes(1);

    const [eventId, dto] = updateSpy.mock.calls[0] as [
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

    // verify payload shape at least for the big fields
    expect(dto.calendar_id).toBe('2');
    expect(dto.title).toBe('Updated Title');
    const expectedStartIso = new Date('2026-01-26T12:00:00').toISOString();
    const expectedEndIso = new Date('2026-01-26T13:00:00').toISOString();

    expect(dto.start_time).toBe(expectedStartIso);
    expect(dto.end_time).toBe(expectedEndIso);


    expect(eventUpdatedSpy).toHaveBeenCalledWith('e1');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('saveChanges should set apiError and NOT call update when end <= start', () => {
    const fixture = TestBed.createComponent(EditEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    // fill in invalid end-before-start
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
    expect(component.apiError).toBe('End must be after start.');
  });


});
