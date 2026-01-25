import { PollOptionDTO } from './poll-option.dto';

/**
 * Represents a poll returned from calendar read endpoints and poll write endpoints.
 */
export interface PollDTO {
  poll_id: string;
  calendar_id: string;

  title: string;
  description?: string;
  notes?: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  results_visible: boolean;
  allow_multiple_votes: boolean;

  options: PollOptionDTO[];
  tags: string[];
}
