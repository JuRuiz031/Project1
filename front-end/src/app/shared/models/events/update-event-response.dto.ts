/**
 * Response body for:
 * PATCH /api/v1/events/{event_id}
 *
 * Note: write endpoints return `event_id` (not `id`).
 */
export interface UpdateEventResponseDTO {
  event_id: number;
  calendar_id: number;

  title: string;

  // ISO-8601 timestamps
  start_time: string;
  end_time: string;

  description?: string;
  notes?: string;

  tags: string[];
}
