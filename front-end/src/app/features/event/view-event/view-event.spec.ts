import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ViewEvent } from './view-event';
import { InviteService } from '../../../shared/services/invite.service';
import { EventDTO } from '../../../shared/models/events/event.dto';

describe('ViewEvent', () => {
  // ViewEvent formats start/end using LOCAL timezone (Date#getHours()).
  // To make these tests stable across machines/timezones, we compute expected
  // values using the same parsing logic.
  const toLocalDateTime = (iso: string): { date: string; time: string } => {
    if (!iso) return { date: '', time: '' };

    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    const d = new Date(hasTz ? iso : `${iso}Z`);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  };

  const mockEvent: EventDTO = {
    event_id: 'e1',
    calendar_id: '2',
    title: 'Team Meeting',
    // no timezone provided -> component assumes UTC and converts to local
    start_time: '2026-01-26T10:15:00',
    end_time: '2026-01-26T11:00:00',
    description: 'Discuss roadmap',
    notes: 'Bring notes',
    tags: ['work'],
  };

  const makeActivatedRouteStub = (token: string | null) => ({
    snapshot: {
      queryParamMap: {
        get: (key: string) => (key === 'token' ? token : null),
      },
    },
  });

  const makeInviteServiceStub = (result$: any) => ({
    getInviteDetails: () => result$,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEvent],
      providers: [
        { provide: ActivatedRoute, useValue: makeActivatedRouteStub(null) },
        { provide: InviteService, useValue: makeInviteServiceStub(of(null)) },
      ],
    }).compileComponents();
  });

  it('ngOnInit should set apiError when token is missing', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: makeActivatedRouteStub(null),
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.apiError()).toBe(
      'Missing invite token. Please use the invite link provided.'
    );
    expect(component.isLoading()).toBe(false);
    expect(component.form.disabled).toBe(true);
  });

  it('ngOnInit should load event by token and populate the form (event invite)', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: makeActivatedRouteStub('tok-123'),
    });
    TestBed.overrideProvider(InviteService, {
      // Should satisfy isEventInvite for typical guards
      useValue: makeInviteServiceStub(of(mockEvent)),
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const expectedStart = toLocalDateTime(mockEvent.start_time);
    const expectedEnd = toLocalDateTime(mockEvent.end_time);

    expect(component.apiError()).toBe('');
    expect(component.isLoading()).toBe(false);
    expect(component.form.disabled).toBe(true);

    expect(component.form.get('title')!.value).toBe('Team Meeting');

    expect(component.form.get('startDate')!.value).toBe(expectedStart.date);
    expect(component.form.get('startTime')!.value).toBe(expectedStart.time);

    expect(component.form.get('endDate')!.value).toBe(expectedEnd.date);
    expect(component.form.get('endTime')!.value).toBe(expectedEnd.time);

    expect(component.form.get('description')!.value).toBe('Discuss roadmap');
    expect(component.form.get('notes')!.value).toBe('Bring notes');
  });

  it('ngOnInit should set apiError to "Event not found" when invite details are null/undefined', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: makeActivatedRouteStub('tok-123'),
    });
    TestBed.overrideProvider(InviteService, {
      useValue: makeInviteServiceStub(of(null)),
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError()).toBe('Event not found');
    expect(component.isLoading()).toBe(false);
    expect(component.form.disabled).toBe(true);
  });

  it('ngOnInit should set apiError to "Invalid event invite link" for non-event invite details', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: makeActivatedRouteStub('tok-123'),
    });

    // Something that should fail most isEventInvite guards
    const nonEventInviteDetails = { poll_id: 'p1', title: 'Some Poll' } as any;

    TestBed.overrideProvider(InviteService, {
      useValue: makeInviteServiceStub(of(nonEventInviteDetails)),
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError()).toBe('Invalid event invite link');
    expect(component.isLoading()).toBe(false);
    expect(component.form.disabled).toBe(true);
  });

  it('ngOnInit should set apiError using err.error.message when the API call fails', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: makeActivatedRouteStub('tok-123'),
    });

    const err = { error: { message: 'boom' } };
    TestBed.overrideProvider(InviteService, {
      useValue: makeInviteServiceStub(throwError(() => err)),
    });

    const fixture = TestBed.createComponent(ViewEvent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.apiError()).toBe('boom');
    expect(component.isLoading()).toBe(false);
    expect(component.form.disabled).toBe(true);
  });
});