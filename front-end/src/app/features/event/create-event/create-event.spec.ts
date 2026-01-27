import { TestBed } from '@angular/core/testing';
import { CreateEvent } from './create-event';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EventApiService } from '../../../shared/services/api/event-api.service';
import { CreateEventDTO } from '../../../shared/models/events/create-event.dto';
import { CreateEventResponseDTO } from '../../../shared/models/events/create-event-response.dto';

describe('CreateEvent', () => {
  let eventApiStub: { createEvent: any };

  const createdResponse: CreateEventResponseDTO = {
    event_id: 'e123',
    calendar_id: '1',
    title: 'Team Meeting',
    start_time: '2026-01-26T18:00:00.000Z',
    end_time: '2026-01-26T19:00:00.000Z',
    description: 'Discuss roadmap',
    notes: 'Bring notes',
    tags: [],
  };

  beforeEach(async () => {
    eventApiStub = {
      createEvent: vi.fn(() => of(createdResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [CreateEvent, RouterTestingModule],
      providers: [{ provide: EventApiService, useValue: eventApiStub }],
    }).compileComponents();

    // provide a fake logged-in user (since create requires user_id)
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('ngOnInit should set default calendarId to first admin calendar', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.form.get('calendarId')?.value).toBe('1');
  });

  it('submit should NOT call api when form is invalid', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.submit();

    expect(eventApiStub.createEvent).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
    expect(component.apiError).toBe('');
  });

  it('submit should set apiError when end <= start and NOT call api', () => {
    const fixture = TestBed.createComponent(CreateEvent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      calendarId: '1',
      title: 'Xy',
      startDate: '2026-01-26',
      startTime: '12:00',
      endDate: '2026-01-26',
      endTime: '12:00', // equal => invalid
      description: '',
      notes: '',
    });

    component.submit();

    expect(component.apiError).toBe('End must be after start.');
    expect(eventApiStub.createEvent).not.toHaveBeenCalled();
  });

  it('submit should call api with CreateEventDTO and navigate to view page on success', () => {
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

    expect(eventApiStub.createEvent).toHaveBeenCalledTimes(1);

    const dto = eventApiStub.createEvent.mock.calls[0][0] as CreateEventDTO;

    expect(dto.user_id).toBe('u1');
    expect(dto.calendar_id).toBe('1');
    expect(dto.title).toBe('Team Meeting');

    // compare ISO using the same construction pattern as component
    const expectedStartIso = new Date('2026-01-26T12:00:00').toISOString();
    const expectedEndIso = new Date('2026-01-26T13:00:00').toISOString();

    expect(dto.start_time).toBe(expectedStartIso);
    expect(dto.end_time).toBe(expectedEndIso);

    expect(navSpy).toHaveBeenCalledWith('/view-event/e123');
    expect(component.isSubmitting).toBe(false);
    expect(component.apiError).toBe('');
  });

  it('submit should show apiError when api call fails', () => {
    eventApiStub.createEvent = vi.fn(() => throwError(() => new Error('boom')));

    // override provider for this test
    TestBed.overrideProvider(EventApiService, { useValue: eventApiStub });

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
      description: '',
      notes: '',
    });

    component.submit();

    expect(component.isSubmitting).toBe(false);
    expect(component.apiError).toBe('Could not create event');
  });
});
