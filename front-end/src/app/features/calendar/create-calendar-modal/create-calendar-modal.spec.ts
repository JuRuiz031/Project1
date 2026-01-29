import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CreateCalendarModal } from './create-calendar-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { CreateCalendarResponseDTO } from '../../../shared/models/calendars/create-calendar-response.dto';

describe('CreateCalendarModal', () => {
  const createdCalendar: CreateCalendarResponseDTO = {
    calendar_id: 'c123',
    name: 'My Calendar',
  };

  const calendarServiceStub = {
    create: jasmine.createSpy('create').and.returnValue(of(createdCalendar)),
  };

  beforeEach(async () => {
    calendarServiceStub.create.calls.reset();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    await TestBed.configureTestingModule({
      imports: [CreateCalendarModal],
      providers: [{ provide: CalendarService, useValue: calendarServiceStub }],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should not call create when form is invalid', () => {
    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // name is required; leave blank
    component.submit();

    expect(calendarServiceStub.create).not.toHaveBeenCalled();
    expect(component.apiError()).toBe('Please fix validation errors.');
  });

  it('should set apiError when missing user id and not call create', () => {
    localStorage.removeItem('user');

    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(component.apiError()).toBe('You must be logged in to create a calendar.');
    expect(calendarServiceStub.create).not.toHaveBeenCalled();
  });

  it('should call CalendarService.create and emit calendarCreated + close on success', () => {
    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const createdEmitSpy = spyOn(component.calendarCreated, 'emit');
    const closeEmitSpy = spyOn(component.close, 'emit');

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(calendarServiceStub.create).toHaveBeenCalledTimes(1);

    const dtoArg = calendarServiceStub.create.calls.mostRecent().args[0];
    expect(dtoArg.user_id).toBe('u1');
    expect(dtoArg.name).toBe('My Calendar');

    expect(createdEmitSpy).toHaveBeenCalledOnceWith('c123');
    expect(closeEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('should show apiError when create fails', () => {
    calendarServiceStub.create.and.returnValue(throwError(() => ({})));

    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(component.apiError()).toBe('Failed to create calendar. Please try again.');
  });
});