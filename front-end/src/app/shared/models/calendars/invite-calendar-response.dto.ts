/**
 * Response body for GET /calendars/{id}/invite
 */
export interface InviteCalendarResponseDTO {
  calendar_id: number;
  invite_link: string;
}
