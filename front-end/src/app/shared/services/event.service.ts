import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { EventApiService } from './api/event-api.service';
import { CreateEventDTO } from '../models/events/create-event.dto';
import { UpdateEventDTO } from '../models/events/update-event.dto';
import { DeleteEventDTO } from '../models/events/delete-event.dto';
import { EventDTO } from '../models/events/event.dto';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: EventApiService) {}

  // POST /events: create new event, requires admin
  create(dto: CreateEventDTO): Observable<EventDTO> {
    return this.api.createEvent(dto).pipe(
      map((r) => ({
        event_id: r.event_id,
        calendar_id: r.calendar_id,
        title: r.title,
        start_time: r.start_time,
        end_time: r.end_time,
        description: r.description,
        notes: r.notes,
        tags: r.tags,
      }))
    );
  }

  // PATCH /events/{id}: update event, requires admin
  update(eventId: string, dto: UpdateEventDTO): Observable<EventDTO> {
    return this.api.updateEvent(eventId, dto).pipe(
      map((r) => ({
        event_id: r.event_id,
        calendar_id: r.calendar_id,
        title: r.title,
        start_time: r.start_time,
        end_time: r.end_time,
        description: r.description,
        notes: r.notes,
        tags: r.tags,
      }))
    );
  }

  // DELETE /events/{id}: delete event, requires admin
  delete(eventId: string, dto: DeleteEventDTO): Observable<boolean> {
    return this.api.deleteEvent(eventId, dto).pipe(map((r) => r.deleted));
  }
}
