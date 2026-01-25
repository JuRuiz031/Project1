import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class CalendarApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // -----------------------
  // READ: Calendar homepage
  // -----------------------

  /** GET /calendar */
  getCalendarHome(): Observable<CalendarHomeDTO> {
    return this.http.get<CalendarHomeDTO>(`${this.baseUrl}/calendar`);
  }

  // -----------------------
  // READ: Filters
  // -----------------------

  getByCalendarIds(calendarIds: Array<string | number>): Observable<CalendarFilterResponseDTO> {
    if (!calendarIds?.length) {
      // If you prefer, you can throw or return getCalendarHome()/empty observable
      return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`);
    }
    const params = new HttpParams().set('calendarIds', calendarIds.join(','));
    return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`, { params });
  }

  getByEventIds(eventIds: Array<string | number>): Observable<CalendarFilterResponseDTO> {
    if (!eventIds?.length) {
      return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`);
    }
    const params = new HttpParams().set('eventIds', eventIds.join(','));
    return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`, { params });
  }

  getByPollIds(pollIds: Array<string | number>): Observable<CalendarFilterResponseDTO> {
    if (!pollIds?.length) {
      return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`);
    }
    const params = new HttpParams().set('pollIds', pollIds.join(','));
    return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`, { params });
  }

  getByTags(tags: string[]): Observable<CalendarFilterResponseDTO> {
    if (!tags?.length) {
      return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`);
    }
    const params = new HttpParams().set('tags', tags.join(','));
    return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`, { params });
  }

  /**
   * Combined filters in one call:
   * /calendar?calendarIds=...&tags=...
   */
  getFiltered(filters: {
    calendarIds?: Array<string | number>;
    eventIds?: Array<string | number>;
    pollIds?: Array<string | number>;
    tags?: string[];
  }): Observable<CalendarFilterResponseDTO> {
    let params = new HttpParams();

    if (filters.calendarIds?.length) params = params.set('calendarIds', filters.calendarIds.join(','));
    if (filters.eventIds?.length) params = params.set('eventIds', filters.eventIds.join(','));
    if (filters.pollIds?.length) params = params.set('pollIds', filters.pollIds.join(','));
    if (filters.tags?.length) params = params.set('tags', filters.tags.join(','));

    // No filters -> just call /calendar
    if (params.keys().length === 0) {
      return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`);
    }

    return this.http.get<CalendarFilterResponseDTO>(`${this.baseUrl}/calendar`, { params });
  }

  // -----------------------
  // WRITE: Calendar CRUD
  // -----------------------

  /** POST /calendar */
  createCalendar(dto: CreateCalendarDTO): Observable<CreateCalendarResponseDTO> {
    return this.http.post<CreateCalendarResponseDTO>(`${this.baseUrl}/calendar`, dto);
  }

  /** PATCH /calendar/{calendar_id} */
  updateCalendar(calendarId: string | number, dto: UpdateCalendarDTO): Observable<UpdateCalendarResponseDTO> {
    return this.http.patch<UpdateCalendarResponseDTO>(`${this.baseUrl}/calendar/${calendarId}`, dto);
  }

  /** DELETE /calendar/{calendar_id} */
  deleteCalendar(calendarId: string | number): Observable<DeleteCalendarResponseDTO> {
    return this.http.delete<DeleteCalendarResponseDTO>(`${this.baseUrl}/calendar/${calendarId}`);
  }

  // -----------------------
  // Invites
  // -----------------------

  /** GET /calendars/{id}/invite */
  getInviteLink(calendarId: string | number): Observable<InviteCalendarResponseDTO> {
    return this.http.get<InviteCalendarResponseDTO>(`${this.baseUrl}/calendars/${calendarId}/invite`);
  }

  /** POST /calendars/invite/accept */
  acceptInvite(dto: AcceptInviteDTO): Observable<AcceptInviteResponseDTO> {
    return this.http.post<AcceptInviteResponseDTO>(`${this.baseUrl}/calendars/invite/accept`, dto);
  }
}
