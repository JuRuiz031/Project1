/**
 * Request body for PATCH /calendar/{calendar_id}
 * All fields optional; omitted fields remain unchanged.
 */
export interface UpdateCalendarDTO {
  name?: string;
  admins?: number[];
}
