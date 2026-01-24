/**
 * Represents a calendar event returned from calendar read endpoints.
 * Events are READ via /calendar queries and WRITTEN via /events endpoints.
 */
export interface EventDTO {
  id: number;
  calendar_id: number;

  title: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  description?: string;
  notes?: string;

  tags: string[];
}
