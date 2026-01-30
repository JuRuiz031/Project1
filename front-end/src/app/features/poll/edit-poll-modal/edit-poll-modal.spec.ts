import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EditPollModal } from './edit-poll-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';

describe('EditPollModal', () => {
  let component: EditPollModal;
  let fixture: ComponentFixture<EditPollModal>;

  const calendarServiceMock = {
    getCalendarSummary: jasmine.createSpy('getCalendarSummary').and.returnValue(of({ home: [], invited: [] })),
  };

  const pollServiceMock = {
    getPoll: jasmine.createSpy('getPoll').and.returnValue(of({
      poll_id: 'poll-1',
      name: 'Test Poll',
      tags: [],
      options: [],
    })),
    updatePoll: jasmine.createSpy('updatePoll').and.returnValue(of({})),
  };

  beforeEach(async () => {
    calendarServiceMock.getCalendarSummary.calls.reset();
    pollServiceMock.getPoll.calls.reset();
    pollServiceMock.updatePoll.calls.reset();

    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    await TestBed.configureTestingModule({
      imports: [EditPollModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceMock },
        { provide: PollService, useValue: pollServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPollModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});