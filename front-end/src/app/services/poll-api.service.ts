import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreatePollDTO } from '../shared/models/polls/create-poll.dto';
import { UpdatePollDTO } from '../shared/models/polls/update-poll.dto';
import { DeletePollDTO } from '../shared/models/polls/delete-poll.dto';
import { PollDTO } from '../shared/models/polls/poll.dto';

@Injectable({
  providedIn: 'root',
})
export class PollApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /** POST /polls */
  createPoll(dto: CreatePollDTO): Observable<PollDTO> {
    return this.http.post<PollDTO>(`${this.baseUrl}/polls`, dto);
  }

  /** PATCH /polls/{id} */
  updatePoll(pollId: string, dto: UpdatePollDTO): Observable<PollDTO> {
    return this.http.patch<PollDTO>(`${this.baseUrl}/polls/${pollId}`, dto);
  }

  /**
   * DELETE /polls/{id}
   * Your API spec includes a request body on DELETE, so we send it using options.body.
   */
  deletePoll(pollId: string, dto: DeletePollDTO): Observable<{ poll_id: string; deleted: boolean }> {
    return this.http.delete<{ poll_id: string; deleted: boolean }>(`${this.baseUrl}/polls/${pollId}`, {
      body: dto,
    });
  }

  /**
   * Poll reads happen through calendar reads:
   * GET /calendar?pollIds=id1,id2
   */
  getPollsByIds(pollIds: string[]): Observable<{ polls: PollDTO[] }> {
    const params = new HttpParams().set('pollIds', pollIds.join(','));
    return this.http.get<{ polls: PollDTO[] }>(`${this.baseUrl}/calendar`, { params });
  }
}
