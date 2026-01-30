import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ViewPollModal } from './view-poll-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';

describe('ViewPollModal', () => {
  let component: ViewPollModal;
  let fixture: ComponentFixture<ViewPollModal>;

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
    votePoll: jasmine.createSpy('votePoll').and.returnValue(of({})),
  };

  beforeEach(async () => {
    calendarServiceMock.getCalendarSummary.calls.reset();
    pollServiceMock.getPoll.calls.reset();
    pollServiceMock.votePoll.calls.reset();

    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ user_id: 'u1' }));

    await TestBed.configureTestingModule({
      imports: [ViewPollModal],
      providers: [
        { provide: CalendarService, useValue: calendarServiceMock },
        { provide: PollService, useValue: pollServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPollModal);
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