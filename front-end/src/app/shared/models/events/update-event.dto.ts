/**
 * Request body for PATCH /events/{id}
 * All fields optional; omitted fields remain unchanged.
 */
export interface UpdateEventDTO {
  user_id?: string;
  calendar_id?: string;

  title?: string;

  start_time?: string; // ISO-8601 timestamp
  end_time?: string;   // ISO-8601 timestamp

  description?: string;
  notes?: string;

  tags?: string[];
}
