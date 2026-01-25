import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { EventApiService } from '../../services/event-api.service';
import { CreateEventDTO } from '../models/events/create-event.dto';
import { UpdateEventDTO } from '../models/events/update-event.dto';
import { DeleteEventDTO } from '../models/events/delete-event.dto';
import { EventDTO } from '../models/events/event.dto';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: EventApiService) {}

  // create(dto: CreateEventDTO): Observable<EventDTO> {
  //   return this.api.createEvent(dto).pipe(
  //     map((r) => ({
  //       id: r.event_id,          // normalize to read-shape
  //       calendar_id: r.calendar_id,
  //       title: r.title,
  //       start_time: r.start_time,
  //       end_time: r.end_time,
  //       description: r.description,
  //       notes: r.notes,
  //       tags: r.tags,
  //     }))
  //   );
  // }

  // update(id: string | number, dto: UpdateEventDTO): Observable<EventDTO> {
  //   return this.api.updateEvent(id, dto).pipe(
  //     map((r) => ({
  //       id: r.event_id,
  //       calendar_id: r.calendar_id,
  //       title: r.title,
  //       start_time: r.start_time,
  //       end_time: r.end_time,
  //       description: r.description,
  //       notes: r.notes,
  //       tags: r.tags,
  //     }))
  //   );
  // }

  // delete(id: string | number, dto: DeleteEventDTO): Observable<boolean> {
  //   return this.api.deleteEvent(id, dto).pipe(map((r) => r.deleted));
  // }
}
