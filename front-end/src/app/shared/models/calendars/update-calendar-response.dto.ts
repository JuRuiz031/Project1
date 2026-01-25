/**
 * Response body for PATCH /calendar/{calendar_id}
 */
export interface UpdateCalendarResponseDTO {
  calendar_id: string;
  name: string;
  admins: string[];
}
