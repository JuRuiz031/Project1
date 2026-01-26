import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateInviteDTO } from '../../models/invites/create-invite.dto';
import { CreateInviteResponseDTO } from '../../models/invites/create-invite-response.dto';
import { InviteDetailsResponseDTO } from '../../models/invites/invite-details-response.dto';

@Injectable({
  providedIn: 'root',
})
export class InviteApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * POST /invite
   * Creates a shareable invite link for an event or poll.
   * Requires JWT auth. User must be admin of the event/poll.
   */
  createInvite(dto: CreateInviteDTO): Observable<CreateInviteResponseDTO> {
    return this.http.post<CreateInviteResponseDTO>(
      `${this.baseUrl}/invite`,
      dto
    );
  }

  /**
   * GET /invitelink?token=xxx
   * Returns details of an event or poll associated with an invite link.
   * No authentication required.
   */
  getInviteDetails(token: string): Observable<InviteDetailsResponseDTO> {
    return this.http.get<InviteDetailsResponseDTO>(
      `${this.baseUrl}/invitelink`,
      { params: { token } }
    );
  }
}
