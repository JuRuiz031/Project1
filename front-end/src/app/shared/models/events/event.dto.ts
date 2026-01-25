/**
 * Represents a calendar event returned from calendar read endpoints.
 * Events are READ via /calendar queries and WRITTEN via /events endpoints.
 */
export interface EventDTO {
  event_id: string;
  calendar_id: string;

  title: string;

  start_time: string; // ISO-8601 timestamp
  end_time: string;   // ISO-8601 timestamp

  description?: string;
  notes?: string;

  tags: string[];
}
