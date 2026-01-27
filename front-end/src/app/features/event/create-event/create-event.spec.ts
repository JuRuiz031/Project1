import { TestBed } from '@angular/core/testing';
import { CreateEvent } from './create-event';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EventService } from '../../../shared/services/event.service';
import { CreateEventDTO } from '../../../shared/models/events/create-event.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

import { vi } from 'vitest';

describe('CreateEvent', () => {
  const createdEvent: EventDTO = {
    event_id: 'e123',
    calendar_id: '1',
    title: 'Team Meeting',
    start_time: '2026-01-26T18:00:00.000Z',
    end_time: '2026-01-26T19:00:00.000Z',
    description: 'Discuss roadmap',
    notes: 'Bring notes',
    tags: [],
  };

  // ✅ Strongly-typed mock so mock.calls is indexable (fixes tuple [] error)
  const createMock = vi.fn<(dto: CreateEventDTO) => ReturnType<EventService['create']>>(
    () => of(createdEvent)
  );

  const eventServiceStub: Pick<EventService, 'create'> = {
    create: createMock,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEvent, RouterTestingModule],
      providers: [{ provide: EventService, useValue: eventServiceStub }],
    }).compileComponents();

    // simulate logged-in user
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('ngOnInit should set default calendarId to first admin calendar', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.form.get('calendarId')?.value).toBe('1');
  });

  it('submit should NOT call create when form is invalid', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.submit();

    expect(createMock).not.toHaveBeenCalled();
    expect(component.apiError).toBe('');
    expect(component.isSubmitting).toBe(false);
  });

  it('submit should set apiError when missing user id and NOT call create', () => {
    localStorage.removeItem('user');

    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      calendarId: '1',
      title: 'OK',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '13:00',
    });

    component.submit();

    expect(component.apiError).toContain('Not logged in');
    expect(createMock).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('submit should set apiError when end <= start and NOT call create', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      calendarId: '1',
      title: 'OK',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '12:00', // equal => invalid
    });

    component.submit();

    expect(component.apiError).toBe('End must be after start.');
    expect(createMock).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('submit should call EventService.create with CreateEventDTO and navigate to view page on success', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    const navSpy = vi.spyOn(router, 'navigateByUrl');

    component.form.patchValue({
      calendarId: '1',
      title: 'Team Meeting',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '13:00',
      description: 'Discuss roadmap',
      notes: 'Bring notes',
    });

    component.submit();

    expect(createMock).toHaveBeenCalledTimes(1);

    // ✅ Typed extraction (no unknown/optional chaining needed)
    const dto = createMock.mock.calls[0][0];

    expect(dto.user_id).toBe('u1');
    expect(dto.calendar_id).toBe('1');
    expect(dto.title).toBe('Team Meeting');

    const expectedStartIso = new Date('2026-01-26T12:00:00').toISOString();
    const expectedEndIso = new Date('2026-01-26T13:00:00').toISOString();

    expect(dto.start_time).toBe(expectedStartIso);
    expect(dto.end_time).toBe(expectedEndIso);

    expect(navSpy).toHaveBeenCalledWith('/view-event/e123');
    expect(component.apiError).toBe('');
    expect(component.isSubmitting).toBe(false);
  });

  it('submit should show apiError when create fails', () => {
    // ✅ Make the NEXT call fail without rebuilding the TestBed
    createMock.mockReturnValueOnce(throwError(() => ({})));

    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      calendarId: '1',
      title: 'Team Meeting',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '13:00',
    });

    component.submit();

    expect(component.apiError).toBe('Could not create event');
    expect(component.isSubmitting).toBe(false);
  });
});
