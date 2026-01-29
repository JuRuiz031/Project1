import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';

import { CreateEventModal } from './create-event-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { EventService } from '../../../shared/services/event.service';

describe('CreateEventModal', () => {
  let fixture: ComponentFixture<CreateEventModal>;
  let component: CreateEventModal;

  const calendarServiceStub = {
    getHomepage: jasmine.createSpy('getHomepage'),
  };

  const eventServiceStub = {
    create: jasmine.createSpy('create'),
  };

  beforeEach(async () => {
    localStorage.clear();

    calendarServiceStub.getHomepage.calls.reset();
    eventServiceStub.create.calls.reset();

    await TestBed.configureTestingModule({
      imports: [CreateEventModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceStub },
        { provide: EventService, useValue: eventServiceStub },
      ],
    }).compileComponents();
  });

  function createComponentWithCalendars(calendars: any[]) {
    calendarServiceStub.getHomepage.and.returnValue(of({ calendars }));

    fixture = TestBed.createComponent(CreateEventModal);
    component = fixture.componentInstance;

    // triggers ngOnInit -> loadCalendars()
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithCalendars([]);
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set default calendarId to first admin calendar', () => {
    createComponentWithCalendars([
      { calendar_id: '1', name: 'Admin Cal', is_admin: true },
      { calendar_id: '2', name: 'User Cal', is_admin: false },
    ]);

    // of(...) emits synchronously, so the form should already be updated
    expect(component.form.get('calendarId')?.value).toBe('1');
    expect(component.apiError()).toBe('');
  });

  it('ngOnInit should fallback to first calendar when no admin calendars exist', () => {
    createComponentWithCalendars([
      { calendar_id: '2', name: 'User Cal A', is_admin: false },
      { calendar_id: '3', name: 'User Cal B', is_admin: false },
    ]);

    expect(component.form.get('calendarId')?.value).toBe('2');
    expect(component.apiError()).toBe('');
  });

  it('submit should NOT call create when form is invalid', () => {
    createComponentWithCalendars([{ calendar_id: '1', name: 'Admin Cal', is_admin: true }]);

    // Leave required fields blank
    component.form.patchValue({
      calendarId: '', // required
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });

    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(eventServiceStub.create).not.toHaveBeenCalled();

    // Component marks touched; it does NOT set apiError for invalid form
    expect(component.form.get('title')?.touched).toBe(true);
  });

  it('submit should set apiError when missing user id and NOT call create', () => {
    createComponentWithCalendars([{ calendar_id: '1', name: 'Admin Cal', is_admin: true }]);

    // No localStorage user
    localStorage.removeItem('user');

    component.form.patchValue({
      calendarId: '1',
      title: 'Test',
      startDate: '2026-01-26',
      startTime: '10:00',
      endDate: '2026-01-26',
      endTime: '11:00',
      description: '',
      notes: '',
    });

    component.submit();

    expect(component.apiError()).toContain('Not logged in');
    expect(eventServiceStub.create).not.toHaveBeenCalled();
  });

  it('submit should set apiError when end <= start and NOT call create', () => {
    createComponentWithCalendars([{ calendar_id: '1', name: 'Admin Cal', is_admin: true }]);

    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    component.form.patchValue({
      calendarId: '1',
      title: 'Test',
      startDate: '2026-01-26',
      startTime: '10:00',
      endDate: '2026-01-26',
      endTime: '10:00', // equal -> invalid
      description: '',
      notes: '',
    });

    component.submit();

    expect(component.apiError()).toBe('End must be after start.');
    expect(eventServiceStub.create).not.toHaveBeenCalled();
  });

  it('submit should show apiError when create fails', () => {
    createComponentWithCalendars([{ calendar_id: '1', name: 'Admin Cal', is_admin: true }]);

    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    eventServiceStub.create.and.returnValue(
      throwError(() => ({ error: { message: 'Could not create event' } }))
    );

    component.form.patchValue({
      calendarId: '1',
      title: 'Test',
      startDate: '2026-01-26',
      startTime: '10:00',
      endDate: '2026-01-26',
      endTime: '11:00',
      description: 'd',
      notes: 'n',
    });

    component.submit();

    expect(component.apiError()).toBe('Could not create event');
    expect(component.isSubmitting()).toBe(false);
  });

  it('submit should call EventService.create with CreateEventDTO and emit eventCreated on success', () => {
    createComponentWithCalendars([{ calendar_id: '1', name: 'Admin Cal', is_admin: true }]);

    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    const created$ = new Subject<any>();
    eventServiceStub.create.and.returnValue(created$.asObservable());

    const eventCreatedSpy = spyOn(component.eventCreated, 'emit');
    const closeSpy = spyOn(component.close, 'emit');

    component.form.patchValue({
      calendarId: '1',
      title: 'Test Title',
      startDate: '2026-01-26',
      startTime: '10:00',
      endDate: '2026-01-26',
      endTime: '11:00',
      description: 'desc',
      notes: 'notes',
    });

    // add tags to ensure they are passed
    component.tags.set(['work', 'school']);

    component.submit();

    expect(component.isSubmitting()).toBe(true);
    expect(eventServiceStub.create).toHaveBeenCalledTimes(1);

    const dtoArg = eventServiceStub.create.calls.mostRecent().args[0];

    // Verify key fields (timestamps are local->UTC so we compute them the same way as the component)
    const expectedStartIso = new Date('2026-01-26T10:00:00').toISOString();
    const expectedEndIso = new Date('2026-01-26T11:00:00').toISOString();

    expect(dtoArg).toEqual(
      jasmine.objectContaining({
        user_id: 'u1',
        calendar_id: '1',
        title: 'Test Title',
        start_time: expectedStartIso,
        end_time: expectedEndIso,
        description: 'desc',
        notes: 'notes',
        tags: ['work', 'school'],
      })
    );

    // Finish the request
    created$.next({ event_id: 'e123' });
    created$.complete();

    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(false);
    expect(eventCreatedSpy).toHaveBeenCalledOnceWith('e123');
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(component.apiError()).toBe('');
  });
});