/**
 * Represents a user associated with a calendar.
 * Returned only for certain calendar read queries when the
 * requesting user is an admin of the calendar.
 */
export interface CalendarUserDTO {
  calendar_id: number;
  user_id: number;
  username: string;
}
