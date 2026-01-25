import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { EventApiService } from './event-api.service';

import { CreateEventDTO } from '../../models/events/create-event.dto';
import { UpdateEventDTO } from '../../models/events/update-event.dto';
import { DeleteEventDTO } from '../../models/events/delete-event.dto';

import { CreateEventResponseDTO } from '../../models/events/create-event-response.dto';
import { UpdateEventResponseDTO } from '../../models/events/update-event-response.dto';
import { DeleteEventResponseDTO } from '../../models/events/delete-event-response.dto';

describe('EventApiService', () => {
  let service: EventApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventApiService],
    });

    service = TestBed.inject(EventApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('createEvent() should POST /events', () => {
    const dto = {
      // keep minimal; add required fields if your DTO enforces them
      title: 'Test Event',
    } as unknown as CreateEventDTO;

    const mockResponse = {
      event_id: '101',
    } as unknown as CreateEventResponseDTO;

    service.createEvent(dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/events`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('updateEvent() should PATCH /events/{event_id}', () => {
    const dto = {
      title: 'Updated Title',
    } as unknown as UpdateEventDTO;

    const mockResponse = {
      event_id: '101',
    } as unknown as UpdateEventResponseDTO;

    service.updateEvent('101', dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/events/101`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('deleteEvent() should DELETE /events/{event_id} with request body', () => {
    const dto = {
      // include whatever your API requires in the delete body
      reason: 'user_confirmed',
    } as unknown as DeleteEventDTO;

    const mockResponse = {
      event_id: '101',
      deleted: true,
    } as unknown as DeleteEventResponseDTO;

    service.deleteEvent('101', dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/events/101`);
    expect(req.request.method).toBe('DELETE');

    // Key assertion: DELETE body exists + matches
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });
});
