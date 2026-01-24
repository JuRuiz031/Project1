import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateEventDTO } from '../shared/models/events/create-event.dto';
import { UpdateEventDTO } from '../shared/models/events/update-event.dto';
import { DeleteEventDTO } from '../shared/models/events/delete-event.dto';

import { CreateEventResponseDTO } from '../shared/models/events/create-event-response.dto';
import { UpdateEventResponseDTO } from '../shared/models/events/update-event-response.dto';
import { DeleteEventResponseDTO } from '../shared/models/events/delete-event-response.dto';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * POST /events
   */
  createEvent(dto: CreateEventDTO): Observable<CreateEventResponseDTO> {
    return this.http.post<CreateEventResponseDTO>(
      `${this.baseUrl}/events`,
      dto
    );
  }

  /**
   * PATCH /events/{event_id}
   */
  updateEvent(
    eventId: number,
    dto: UpdateEventDTO
  ): Observable<UpdateEventResponseDTO> {
    return this.http.patch<UpdateEventResponseDTO>(
      `${this.baseUrl}/events/${eventId}`,
      dto
    );
  }

  /**
   * DELETE /events/{event_id}
   * (uses request body per API spec)
   */
  deleteEvent(
    eventId: number,
    dto: DeleteEventDTO
  ): Observable<DeleteEventResponseDTO> {
    return this.http.delete<DeleteEventResponseDTO>(
      `${this.baseUrl}/events/${eventId}`,
      { body: dto }
    );
  }
}
