import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { PollApiService } from './poll-api.service';

import { CreatePollDTO } from '../shared/models/polls/create-poll.dto';
import { UpdatePollDTO } from '../shared/models/polls/update-poll.dto';
import { DeletePollDTO } from '../shared/models/polls/delete-poll.dto';

import { CreatePollResponseDTO } from '../shared/models/polls/create-poll-response.dto';
import { UpdatePollResponseDTO } from '../shared/models/polls/update-poll-response.dto';
import { DeletePollResponseDTO } from '../shared/models/polls/delete-poll-response.dto';

describe('PollApiService', () => {
  let service: PollApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PollApiService],
    });

    service = TestBed.inject(PollApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('createPoll() should POST /polls', () => {
    const dto = {
      title: 'Test Poll',
    } as unknown as CreatePollDTO;

    const mockResponse = {
      poll_id: 201,
    } as unknown as CreatePollResponseDTO;

    service.createPoll(dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/polls`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('updatePoll() should PATCH /polls/{poll_id}', () => {
    const dto = {
      title: 'Updated Poll Title',
    } as unknown as UpdatePollDTO;

    const mockResponse = {
      poll_id: 201,
    } as unknown as UpdatePollResponseDTO;

    service.updatePoll(201, dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/polls/201`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('deletePoll() should DELETE /polls/{poll_id} with request body', () => {
    const dto = {
      reason: 'user_confirmed',
    } as unknown as DeletePollDTO;

    const mockResponse = {
      poll_id: 201,
      deleted: true,
    } as unknown as DeletePollResponseDTO;

    service.deletePoll(201, dto).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/polls/201`);
    expect(req.request.method).toBe('DELETE');

    // Key assertion: DELETE body exists + matches
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });
});
