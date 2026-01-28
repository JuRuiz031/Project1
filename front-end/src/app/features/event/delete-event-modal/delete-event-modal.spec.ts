import { TestBed } from '@angular/core/testing';
import { DeleteEventModal } from './delete-event-modal';
import { of, throwError } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { EventService } from '../../../shared/services/event.service';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';
import { DeleteEventDTO } from '../../../shared/models/events/delete-event.dto';

import { vi } from 'vitest';

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
    getByEventIds: vi.fn((_ids: string[]) =>
      of<CalendarFilterResponseDTO>({ events: [mockEvent] })
    ),
  };

  const eventServiceStub = {
    delete: vi.fn((_eventId: string, _dto: DeleteEventDTO) => of(true)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEventModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceStub },
        { provide: EventService, useValue: eventServiceStub },
      ],
    }).compileComponents();

    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('ngOnInit should load the event via CalendarService and populate eventName/calendarName', () => {
    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.apiError).toBe('');
    expect(calendarServiceStub.getByEventIds).toHaveBeenCalledTimes(1);
    expect(component.eventName).toBe('Loaded Event');
    // calendar_id is "1" which exists in calendars array -> "My Admin Calendar indicated in component calendars"
    expect(component.calendarName).toBeTruthy();
  });

  it('ngOnInit should set apiError when no event is returned', () => {
    calendarServiceStub.getByEventIds.mockReturnValueOnce(
      of<CalendarFilterResponseDTO>({ events: [] })
    );

    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError).toBe('Event not found');
  });

  it('confirmDelete should set apiError when missing user id and NOT call delete', () => {
    localStorage.removeItem('user');

    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;
    fixture.detectChanges(); // loads eventId + calendarId

    component.confirmDelete();

    expect(component.apiError).toContain('Not logged in');
    expect(eventServiceStub.delete).not.toHaveBeenCalled();
    expect(component.isDeleting).toBe(false);
  });

  it('confirmDelete should call EventService.delete with correct dto and emit eventDeleted on success', () => {
    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // loads event + sets calendarId, eventId

    const eventDeletedSpy = vi.fn();
    const closeSpy = vi.fn();
    component.eventDeleted.subscribe(eventDeletedSpy);
    component.close.subscribe(closeSpy);

    component.confirmDelete();

    expect(eventServiceStub.delete).toHaveBeenCalledTimes(1);

    const call = eventServiceStub.delete.mock.calls[0];
    const eventIdArg = call?.[0] as string;
    const dtoArg = call?.[1] as DeleteEventDTO;

    expect(eventIdArg).toBe('e1');
    expect(dtoArg.user_id).toBe('u1');
    expect(dtoArg.calendar_id).toBe('1');

    expect(eventDeletedSpy).toHaveBeenCalledWith('e1');
    expect(closeSpy).toHaveBeenCalled();
    expect(component.apiError).toBe('');
    expect(component.isDeleting).toBe(false);
  });

  it('confirmDelete should show apiError when delete fails', () => {
    eventServiceStub.delete.mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );

    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.confirmDelete();

    // Your DeleteEvent uses err.message as fallback, so this becomes "boom"
    expect(component.apiError).toBe('boom');
    expect(component.isDeleting).toBe(false);
  });

  it('onClose should emit close event', () => {
    const fixture = TestBed.createComponent(DeleteEventModal);
    const component = fixture.componentInstance;

    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.onClose();

    expect(closeSpy).toHaveBeenCalled();
  });
});
