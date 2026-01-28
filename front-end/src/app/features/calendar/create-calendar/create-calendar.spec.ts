import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CreateCalendar } from './create-calendar';
import { CalendarService } from '../../../shared/services/calendar.service';
import { Router } from '@angular/router';

describe('CreateCalendar', () => {
  let component: CreateCalendar;
  let fixture: ComponentFixture<CreateCalendar>;

  const calendarServiceMock = {
    create: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCalendar],
      providers: [
        { provide: CalendarService, useValue: calendarServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCalendar);
    component = fixture.componentInstance;

    // Stub localStorage user for the component’s getCurrentUserId()
    localStorage.setItem('user', JSON.stringify({ user_id: 'u123' }));

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call CalendarService.create and navigate on success', () => {
    calendarServiceMock.create.mockReturnValue(of({ calendar_id: 'c1', name: 'My Cal' }));

    component.form.setValue({ name: 'My Cal' });
    component.createCalendar();

    expect(calendarServiceMock.create).toHaveBeenCalledWith({
      user_id: 'u123',
      name: 'My Cal',
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/main-page']);
  });

  it('should show api error on failure', () => {
    calendarServiceMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Nope' } }))
    );

    component.form.setValue({ name: 'My Cal' });
    component.createCalendar();

    expect(component.apiError()).toBe('Nope');
  });
});
