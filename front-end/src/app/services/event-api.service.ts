import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateEventDTO } from '../shared/models/events/create-event.dto';
import { UpdateEventDTO } from '../shared/models/events/update-event.dto';
import { DeleteEventDTO } from '../shared/models/events/delete-event.dto';
import { EventDTO } from '../shared/models/events/event.dto';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /** POST /events */
  createEvent(dto: CreateEventDTO): Observable<EventDTO> {
    return this.http.post<EventDTO>(`${this.baseUrl}/events`, dto);
  }

  /** PATCH /events/{id} */
  updateEvent(eventId: string | number, dto: UpdateEventDTO): Observable<EventDTO> {
    return this.http.patch<EventDTO>(`${this.baseUrl}/events/${eventId}`, dto);
  }

  /**
   * DELETE /events/{id}
   * DELETE uses a request body in your spec, so we send it via options.body.
   */
  deleteEvent(
    eventId: string | number,
    dto: DeleteEventDTO
  ): Observable<{ event_id: number; calendar_id: number; deleted: boolean }> {
    return this.http.delete<{ event_id: number; calendar_id: number; deleted: boolean }>(
      `${this.baseUrl}/events/${eventId}`,
      { body: dto }
    );
  }
}
