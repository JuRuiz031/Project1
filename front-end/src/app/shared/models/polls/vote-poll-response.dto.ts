import { PollOptionDTO } from './poll-option.dto';

/**
 * Response body for POST /polls/{poll_id}/vote
 * Returns the updated poll with vote counts
 */
export interface VotePollResponseDTO {
  poll_id: string;
  calendar_id: string;

  title: string;
  description?: string;
  notes?: string;

  start_time: string;
  end_time: string;

  results_visible: boolean;
  allow_multiple_votes: boolean;

  options: PollOptionDTO[];
  tags: string[];
}
