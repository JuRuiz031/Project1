import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreatePollDTO } from '../../models/polls/create-poll.dto';
import { UpdatePollDTO } from '../../models/polls/update-poll.dto';
import { DeletePollDTO } from '../../models/polls/delete-poll.dto';

import { CreatePollResponseDTO } from '../../models/polls/create-poll-response.dto';
import { UpdatePollResponseDTO } from '../../models/polls/update-poll-response.dto';
import { DeletePollResponseDTO } from '../../models/polls/delete-poll-response.dto';

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
    pollId: string,
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
    pollId: string,
    dto: DeletePollDTO
  ): Observable<DeletePollResponseDTO> {
    return this.http.delete<DeletePollResponseDTO>(
      `${this.baseUrl}/polls/${pollId}`,
      { body: dto }
    );
  }
}
