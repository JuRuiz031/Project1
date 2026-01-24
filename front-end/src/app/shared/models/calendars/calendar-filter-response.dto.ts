import { EventDTO } from '../events/event.dto';
import { PollDTO } from '../polls/poll.dto';
import { CalendarUserDTO } from './calendar-user.dto';

/**
 * Response shape for calendar "filter" reads:
 * - GET /calendar?calendarIds=...
 * - GET /calendar?eventIds=...
 * - GET /calendar?pollIds=...
 * - GET /calendar?tags=...
 *
 * Endpoints.md notes:
 * - calendarIds can return events + polls, and sometimes users (admin-only)
 * - eventIds returns only events
 * - pollIds returns only polls
 * - tags returns events + polls, never users
 */
export interface CalendarFilterResponseDTO {
  events?: EventDTO[];
  polls?: PollDTO[];
  users?: CalendarUserDTO[];
}
