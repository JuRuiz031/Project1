import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreatePollDTO } from '../shared/models/polls/create-poll.dto';
import { UpdatePollDTO } from '../shared/models/polls/update-poll.dto';
import { DeletePollDTO } from '../shared/models/polls/delete-poll.dto';

import { CreatePollResponseDTO } from '../shared/models/polls/create-poll-response.dto';
import { UpdatePollResponseDTO } from '../shared/models/polls/update-poll-response.dto';
import { DeletePollResponseDTO } from '../shared/models/polls/delete-poll-response.dto';

@Injectable({
  providedIn: 'root',
})
export class PollApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * POST /polls
   */
  createPoll(dto: CreatePollDTO): Observable<CreatePollResponseDTO> {
    return this.http.post<CreatePollResponseDTO>(
      `${this.baseUrl}/polls`,
      dto
    );
  }

  /**
   * PATCH /polls/{poll_id}
   */
  updatePoll(
    pollId: number,
    dto: UpdatePollDTO
  ): Observable<UpdatePollResponseDTO> {
    return this.http.patch<UpdatePollResponseDTO>(
      `${this.baseUrl}/polls/${pollId}`,
      dto
    );
  }

  /**
   * DELETE /polls/{poll_id}
   * (uses request body per API spec)
   */
  deletePoll(
    pollId: number,
    dto: DeletePollDTO
  ): Observable<DeletePollResponseDTO> {
    return this.http.delete<DeletePollResponseDTO>(
      `${this.baseUrl}/polls/${pollId}`,
      { body: dto }
    );
  }
}
