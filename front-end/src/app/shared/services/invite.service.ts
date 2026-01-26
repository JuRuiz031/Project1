import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InviteApiService } from './api/invite-api.service';
import { CreateInviteDTO } from '../models/invites/create-invite.dto';
import { CreateInviteResponseDTO } from '../models/invites/create-invite-response.dto';
import { InviteDetailsResponseDTO } from '../models/invites/invite-details-response.dto';

@Injectable({ providedIn: 'root' })
export class InviteService {
  constructor(private api: InviteApiService) {}

  /**
   * Creates an invite link for an event.
   * Requires admin privileges on the event.
   */
  createEventInvite(eventId: string, expirationDate: string): Observable<CreateInviteResponseDTO> {
    const dto: CreateInviteDTO = {
      event_id: eventId,
      expiration_date: expirationDate,
    };
    return this.api.createInvite(dto);
  }

  /**
   * Creates an invite link for a poll.
   * Requires admin privileges on the poll.
   */
  createPollInvite(pollId: string, expirationDate: string): Observable<CreateInviteResponseDTO> {
    const dto: CreateInviteDTO = {
      poll_id: pollId,
      expiration_date: expirationDate,
    };
    return this.api.createInvite(dto);
  }

  /**
   * Gets details of an event or poll from an invite token.
   * No authentication required.
   * Use isEventInvite() or isPollInvite() type guards to determine the response type.
   */
  getInviteDetails(token: string): Observable<InviteDetailsResponseDTO> {
    return this.api.getInviteDetails(token);
  }
}
