/**
 * Request body for POST /events
 */
export interface CreateEventDTO {
  user_id: number;
  calendar_id: number;

  title: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  description?: string;
  notes?: string;

  tags: string[];
}
