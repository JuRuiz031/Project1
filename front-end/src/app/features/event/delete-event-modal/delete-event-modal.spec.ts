import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DeleteEventModal } from './delete-event-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { EventService } from '../../../shared/services/event.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';
import { DeleteEventDTO } from '../../../shared/models/events/delete-event.dto';

describe('DeleteEventModal', () => {
  const mockEvent: EventDTO = {
    event_id: 'e1',
    calendar_id: '1',
    title: 'Loaded Event',
    start_time: '2026-01-26T10:15:00',
    end_time: '2026-01-26T11:00:00',
    description: 'Loaded desc',
    notes: 'Loaded notes',
    tags: [],
  };

  const calendarServiceStub = {
    getByEventIds: jasmine.createSpy('getByEventIds'),
    getHomepage: jasmine.createSpy('getHomepage'),
  };

  const eventServiceStub = {
    delete: jasmine.createSpy('delete'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEventModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceStub },
        { provide: EventService, useValue: eventServiceStub },
      ],
    }).compileComponents();

    // defaults (individual tests can override)
    calendarServiceStub.getByEventIds.calls.reset();
    calendarServiceStub.getHomepage.calls.reset();
    eventServiceStub.delete.calls.reset();

    calendarServiceStub.getByEventIds.and.returnValue(
      of<CalendarFilterResponseDTO>({ events: [mockEvent] })
    );
    calendarServiceStub.getHomepage.and.returnValue(
      of({ calendars: [{ calendar_id: '1', name: 'My Admin Calendar' }] })
    );
    eventServiceStub.delete.and.returnValue(of(true));

    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ✅ Always set required input BEFORE first detectChanges to avoid NG0950.
   */
  function createWithEventId(eventId = 'e1') {
    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('eventId', eventId);
    fixture.detectChanges(); // triggers ngOnInit safely

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = createWithEventId('e1');
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load the event via CalendarService and populate eventName/calendarName', () => {
    const { component } = createWithEventId('e1');

    expect(component.apiError()).toBe('');
    expect(calendarServiceStub.getByEventIds).toHaveBeenCalledOnceWith(['e1']);
    expect(component.eventName()).toBe('Loaded Event');

    expect(calendarServiceStub.getHomepage).toHaveBeenCalledTimes(1);
    expect(component.calendarName()).toBe('My Admin Calendar');
  });

  it('ngOnInit should set apiError when no event is returned', () => {
    calendarServiceStub.getByEventIds.and.returnValue(
      of<CalendarFilterResponseDTO>({ events: [] })
    );

    const { component } = createWithEventId('e1');

    expect(component.apiError()).toBe('Event not found');
  });

  it('confirmDelete should set apiError when missing user id and NOT call delete', () => {
    localStorage.removeItem('user');

    const { component } = createWithEventId('e1');

    component.confirmDelete();

    expect(component.apiError()).toContain('Not logged in');
    expect(eventServiceStub.delete).not.toHaveBeenCalled();
    expect(component.isDeleting()).toBe(false);
  });

  it('confirmDelete should call EventService.delete with correct dto and emit eventDeleted on success', () => {
    const { component } = createWithEventId('e1');

    const eventDeletedEmitSpy = spyOn(component.eventDeleted, 'emit');
    const closeEmitSpy = spyOn(component.close, 'emit');

    component.confirmDelete();

    expect(eventServiceStub.delete).toHaveBeenCalledTimes(1);

    const [eventIdArg, dtoArg] = eventServiceStub.delete.calls.mostRecent()
      .args as [string, DeleteEventDTO];

    expect(eventIdArg).toBe('e1');
    expect(dtoArg.user_id).toBe('u1');
    expect(dtoArg.calendar_id).toBe('1');

    expect(eventDeletedEmitSpy).toHaveBeenCalledOnceWith('e1');
    expect(closeEmitSpy).toHaveBeenCalledTimes(1);

    expect(component.apiError()).toBe('');
    expect(component.isDeleting()).toBe(false);
  });

  it('confirmDelete should show apiError when delete fails', () => {
    eventServiceStub.delete.and.returnValue(throwError(() => new Error('boom')));

    const { component } = createWithEventId('e1');

    component.confirmDelete();

    expect(component.apiError()).toBe('boom');
    expect(component.isDeleting()).toBe(false);
  });

  it('onClose should emit close event', () => {
    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    const closeEmitSpy = spyOn(component.close, 'emit');

    component.onClose();

    expect(closeEmitSpy).toHaveBeenCalledTimes(1);
  });
});