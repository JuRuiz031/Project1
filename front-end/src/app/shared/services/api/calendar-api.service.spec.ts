import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CalendarApiService } from './calendar-api.service';

import { CalendarHomeDTO } from '../../models/calendars/calendar-home.dto';
import { CalendarFilterResponseDTO } from '../../models/calendars/calendar-filter-response.dto';

import { CreateCalendarDTO } from '../../models/calendars/create-calendar.dto';
import { CreateCalendarResponseDTO } from '../../models/calendars/create-calendar-response.dto';

import { UpdateCalendarDTO } from '../../models/calendars/update-calendar.dto';
import { UpdateCalendarResponseDTO } from '../../models/calendars/update-calendar-response.dto';

import { DeleteCalendarResponseDTO } from '../../models/calendars/delete-calendar-response.dto';

import { InviteCalendarResponseDTO } from '../../models/calendars/invite-calendar-response.dto';
import { AcceptInviteDTO } from '../../models/calendars/accept-invite.dto';
import { AcceptInviteResponseDTO } from '../../models/calendars/accept-invite-response.dto';

describe('CalendarApiService', () => {
  let service: CalendarApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalendarApiService],
    });

    service = TestBed.inject(CalendarApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // -----------------------
  // READ: Calendar homepage
  // -----------------------

  it('getCalendarHome() should GET /calendar', () => {
    const mock = { ok: true } as unknown as CalendarHomeDTO;

    service.getCalendarHome().subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  // -----------------------
  // READ: Filters (single)
  // -----------------------

  it('getByCalendarIds() should GET /calendar?calendarIds=1,2,3', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getByCalendarIds(['1', '2', '3']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('calendarIds')).toBe('1,2,3');

    req.flush(mock);
  });

  it('getByCalendarIds() with empty array should GET /calendar (no params)', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getByCalendarIds([]).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush(mock);
  });

  it('getByEventIds() should GET /calendar?eventIds=10,11', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getByEventIds(['10', '11']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('eventIds')).toBe('10,11');

    req.flush(mock);
  });

  it('getByPollIds() should GET /calendar?pollIds=7,8', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getByPollIds(['7', '8']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pollIds')).toBe('7,8');

    req.flush(mock);
  });

  it('getByTags() should GET /calendar?tags=work,school', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getByTags(['work', 'school']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('tags')).toBe('work,school');

    req.flush(mock);
  });

  // -----------------------
  // READ: Filters (combined)
  // -----------------------

  it('getFiltered() should GET /calendar with combined params', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getFiltered({
      calendarIds: ['1', '2'],
      eventIds: ['10'],
      pollIds: ['7', '8'],
      tags: ['work'],
    }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');

    expect(req.request.params.get('calendarIds')).toBe('1,2');
    expect(req.request.params.get('eventIds')).toBe('10');
    expect(req.request.params.get('pollIds')).toBe('7,8');
    expect(req.request.params.get('tags')).toBe('work');

    req.flush(mock);
  });

  it('getFiltered() with no filters should GET /calendar (no params)', () => {
    const mock = { ok: true } as unknown as CalendarFilterResponseDTO;

    service.getFiltered({}).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/calendar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush(mock);
  });

  // -----------------------
  // WRITE: Calendar CRUD
  // -----------------------

  it('createCalendar() should POST /calendar', () => {
    const dto = { name: 'My Calendar' } as unknown as CreateCalendarDTO;
    const mock = { calendar_id: '123' } as unknown as CreateCalendarResponseDTO;

    service.createCalendar(dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush(mock);
  });

  it('updateCalendar() should PATCH /calendar/{id}', () => {
    const dto = { name: 'Updated Name' } as unknown as UpdateCalendarDTO;
    const mock = { calendar_id: '123' } as unknown as UpdateCalendarResponseDTO;

    service.updateCalendar('123', dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendar/123`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(mock);
  });

  it('deleteCalendar() should DELETE /calendar/{id}', () => {
    const mock = { calendar_id: '123', deleted: true } as unknown as DeleteCalendarResponseDTO;

    service.deleteCalendar('123').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendar/123`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mock);
  });

  // -----------------------
  // Invites
  // -----------------------

  it('getInviteLink() should GET /calendars/{id}/invite', () => {
    const mock = { invite_url: 'https://example.com/invite' } as unknown as InviteCalendarResponseDTO;

    service.getInviteLink('55').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendars/55/invite`);
    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('acceptInvite() should POST /calendars/invite/accept', () => {
    const dto = { invite_token: 'abc' } as unknown as AcceptInviteDTO;
    const mock = { ok: true } as unknown as AcceptInviteResponseDTO;

    service.acceptInvite(dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/calendars/invite/accept`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush(mock);
  });
});
