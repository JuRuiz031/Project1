/**
 * Response body for PATCH /calendar/{calendar_id}
 */
export interface UpdateCalendarResponseDTO {
  calendar_id: number;
  name: string;
  admins: number[];
}
