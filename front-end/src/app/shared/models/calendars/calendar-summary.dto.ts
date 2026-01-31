/**
 * User info for calendar members.
 */
export interface UserInfo {
  user_id: string;
  username: string;
  is_admin: boolean;
}

/**
 * Minimal calendar representation used in lists and selectors.
 */
export interface CalendarSummaryDTO {
  calendar_id: string;
  name: string;
  is_admin: boolean;
  users: UserInfo[];
}
