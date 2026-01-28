import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CreateCalendarModal } from './create-calendar-modal';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CreateCalendarDTO } from '../../../shared/models/calendars/create-calendar.dto';
import { CreateCalendarResponseDTO } from '../../../shared/models/calendars/create-calendar-response.dto';

describe('CreateCalendarModal', () => {
  const createdCalendar: CreateCalendarResponseDTO = {
    calendar_id: 'c123',
    name: 'My Calendar',
  };

  const createMock = vi.fn<(dto: CreateCalendarDTO) => ReturnType<CalendarService['create']>>(
    () => of(createdCalendar)
  );

  const calendarServiceStub: Pick<CalendarService, 'create'> = {
    create: createMock,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCalendarModal],
      providers: [{ provide: CalendarService, useValue: calendarServiceStub }],
    }).compileComponents();

    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should not call create when form is invalid', () => {
    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.submit();

    expect(createMock).not.toHaveBeenCalled();
  });

  it('should set apiError when missing user id and not call create', () => {
    localStorage.removeItem('user');

    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(component.apiError()).toContain('logged in');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('should call CalendarService.create and emit calendarCreated + close on success', () => {
    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const createdSpy = vi.fn();
    const closeSpy = vi.fn();
    component.calendarCreated.subscribe(createdSpy);
    component.close.subscribe(closeSpy);

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(createMock).toHaveBeenCalledTimes(1);
    const dto = createMock.mock.calls[0][0];
    expect(dto.user_id).toBe('u1');
    expect(dto.name).toBe('My Calendar');

    expect(createdSpy).toHaveBeenCalledWith('c123');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should show apiError when create fails', () => {
    createMock.mockReturnValueOnce(throwError(() => ({})));

    const fixture = TestBed.createComponent(CreateCalendarModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ name: 'My Calendar' });
    component.submit();

    expect(component.apiError()).toBe('Failed to create calendar. Please try again.');
  });
});
