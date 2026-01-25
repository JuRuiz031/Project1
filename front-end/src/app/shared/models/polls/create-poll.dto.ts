/**
 * Request body for POST /polls
 */
export interface CreatePollDTO {
  user_id: string;
  calendar_id: string;

  title: string;
  description?: string;
  notes?: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  results_visible: boolean;
  allow_multiple_votes: boolean;

  options: {
    description: string;
  }[];

  tags: string[];
}
