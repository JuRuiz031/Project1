/**
 * Represents a single selectable option in a poll.
 */
export interface PollOptionDTO {
  option_id: number;
  description: string;

  /** Array of user IDs (MongoDB ObjectIds) who voted for this option, or null if no votes */
  user_votes: string[] | null;
  /** Array of guest names who voted for this option, or null if no votes */
  guest_votes: string[] | null;
}
