/**
 * Response body for:
 * PATCH /api/v1/polls/{poll_id}
 *
 * Note: write endpoints return `poll_id` (not `id`).
 */
export interface UpdatePollResponseDTO {
  poll_id: number;
  calendar_id: number;

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
  }>;

  tags: string[];
}
