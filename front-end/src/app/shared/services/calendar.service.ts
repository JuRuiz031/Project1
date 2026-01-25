import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CalendarApiService } from './api/calendar-api.service';

// DTOs
import { CalendarHomeDTO } from '../models/calendars/calendar-home.dto';
import { CalendarFilterResponseDTO } from '../models/calendars/calendar-filter-response.dto';
import { CalendarSummaryDTO } from '../models/calendars/calendar-summary.dto';

import { CreateCalendarDTO } from '../models/calendars/create-calendar.dto';
import { CreateCalendarResponseDTO } from '../models/calendars/create-calendar-response.dto';

import { UpdateCalendarDTO } from '../models/calendars/update-calendar.dto';
import { UpdateCalendarResponseDTO } from '../models/calendars/update-calendar-response.dto';

import { DeleteCalendarResponseDTO } from '../models/calendars/delete-calendar-response.dto';

import { InviteCalendarResponseDTO } from '../models/calendars/invite-calendar-response.dto';
import { AcceptInviteDTO } from '../models/calendars/accept-invite.dto';
import { AcceptInviteResponseDTO } from '../models/calendars/accept-invite-response.dto';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  constructor(private api: CalendarApiService) {}

  // GET /calendar: returns user's calendars + tags
  getHomepage(): Observable<CalendarHomeDTO> {
    return this.api.getCalendarHome();
  }

  // GET /calendar?calendarIds=...: events/polls for specific calendars
  getByCalendarIds(calendarIds: string[]): Observable<CalendarFilterResponseDTO> {
    return this.api.getByCalendarIds(calendarIds);
  }

  // GET /calendar?eventIds=...: specific events only
  getByEventIds(eventIds: string[]): Observable<CalendarFilterResponseDTO> {
    return this.api.getByEventIds(eventIds);
  }

  // GET /calendar?pollIds=...: specific polls only
  getByPollIds(pollIds: string[]): Observable<CalendarFilterResponseDTO> {
    return this.api.getByPollIds(pollIds);
  }

  // GET /calendar?tags=...: events/polls matching tags
  getByTags(tags: string[]): Observable<CalendarFilterResponseDTO> {
    return this.api.getByTags(tags);
  }

  // GET /calendar with combined filters
  getFiltered(filters: {
    calendarIds?: string[];
    eventIds?: string[];
    pollIds?: string[];
    tags?: string[];
  }): Observable<CalendarFilterResponseDTO> {
    return this.api.getFiltered(filters);
  }

  // POST /calendar: create new calendar
  create(dto: CreateCalendarDTO): Observable<CreateCalendarResponseDTO> {
    return this.api.createCalendar(dto);
  }

  // PATCH /calendar/{id}: update name or promote admins, requires admin
  update(calendarId: string, dto: UpdateCalendarDTO): Observable<UpdateCalendarResponseDTO> {
    return this.api.updateCalendar(calendarId, dto);
  }

  // DELETE /calendar/{id}: delete calendar, requires admin
  delete(calendarId: string): Observable<DeleteCalendarResponseDTO> {
    return this.api.deleteCalendar(calendarId);
  }

  // GET /calendars/{id}/invite: generate invite link, requires admin
  getInviteLink(calendarId: string): Observable<InviteCalendarResponseDTO> {
    return this.api.getInviteLink(calendarId);
  }

  // POST /calendars/invite/accept: accept invite and join calendar
  acceptInvite(inviteToken: string): Observable<AcceptInviteResponseDTO> {
    return this.api.acceptInvite({ invite_token: inviteToken });
  }
}
