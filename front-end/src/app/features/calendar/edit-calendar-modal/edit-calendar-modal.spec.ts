import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EditCalendarModal } from './edit-calendar-modal';
import { CalendarService } from '../../../shared/services/calendar.service';

describe('EditCalendarModal', () => {
  let component: EditCalendarModal;
  let fixture: ComponentFixture<EditCalendarModal>;

  const calendarServiceStub = {
    getHomepage: jasmine.createSpy('getHomepage').and.returnValue(of({ calendars: [] })),
    getByCalendarIds: jasmine.createSpy('getByCalendarIds').and.returnValue(of({ users: [] })),
    update: jasmine.createSpy('update').and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCalendarModal],
      providers: [{ provide: CalendarService, useValue: calendarServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCalendarModal);
    component = fixture.componentInstance;

    // ✅ REQUIRED inputs must be set BEFORE the first detectChanges()
    fixture.componentRef.setInput('calendarId', 'c1');
    fixture.componentRef.setInput('currentUserId', 'u1');

    fixture.detectChanges(); // triggers ngOnInit safely
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});