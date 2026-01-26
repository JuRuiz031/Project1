/**
 * Response body for:
 * POST /api/v1/polls
 *
 * Note: write endpoints return `poll_id` (not `id`).
 */
export interface CreatePollResponseDTO {
  poll_id: string;
  calendar_id: string;

  title: string;

  description?: string;
  notes?: string;

  // ISO-8601 timestamps
  start_time: string;
  end_time: string;

  results_visible: boolean;
  allow_multiple_votes: boolean;

  options: Array<{
    option_id: number;
    description: string;
    user_votes: string[] | null;
    guest_votes: string[] | null;
  }>;

  tags: string[];
}
