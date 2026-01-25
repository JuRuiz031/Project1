/**
 * Response body for:
 * POST /api/v1/events
 *
 * Note: write endpoints return `event_id` (not `id`).
 */
export interface CreateEventResponseDTO {
  event_id: string;
  calendar_id: string;

  title: string;

  // ISO-8601 timestamps
  start_time: string;
  end_time: string;

  description?: string;
  notes?: string;

  tags: string[];
}
