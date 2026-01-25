/**
 * Response body for GET /calendars/{id}/invite
 */
export interface InviteCalendarResponseDTO {
  calendar_id: string;
  invite_link: string;
}
