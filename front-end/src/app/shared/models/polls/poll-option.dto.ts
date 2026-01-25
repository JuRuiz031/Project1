/**
 * Represents a single selectable option in a poll.
 */
export interface PollOptionDTO {
  option_id: string;
  description: string;

  user_votes: string[];
  guest_votes: string[];
}
