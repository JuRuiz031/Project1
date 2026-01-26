import { EventDTO } from '../events/event.dto';
import { PollDTO } from '../polls/poll.dto';

/**
 * Response body for GET /invitelink?token=xxx
 * Returns either an EventDTO or PollDTO depending on the invite type.
 * 
 * Use type guards to determine which type was returned:
 * - 'event_id' in response → EventDTO
 * - 'poll_id' in response → PollDTO
 */
export type InviteDetailsResponseDTO = EventDTO | PollDTO;

/**
 * Type guard to check if the invite details are for an event
 */
export function isEventInvite(details: InviteDetailsResponseDTO): details is EventDTO {
  return 'event_id' in details;
}

/**
 * Type guard to check if the invite details are for a poll
 */
export function isPollInvite(details: InviteDetailsResponseDTO): details is PollDTO {
  return 'poll_id' in details;
}
