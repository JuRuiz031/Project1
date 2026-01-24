/**
 * Request body for PATCH /polls/{id}
 * All fields are optional; omitted fields remain unchanged.
 */
export interface UpdatePollDTO {
  user_id?: number;
  calendar_id?: number;

  title?: string;
  description?: string;
  notes?: string;

  start_time?: string; // ISO-8601 timestamp
  end_time?: string;   // ISO-8601 timestamp

  results_visible?: boolean;
  allow_multiple_votes?: boolean;

  options?: {
    description: string;
  }[];

  tags?: string[];
}
