/**
 * Request body for POST /events
 */
export interface CreateEventDTO {
  user_id: string;
  calendar_id: string;

  title: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  description?: string;
  notes?: string;

  tags: string[];
}
